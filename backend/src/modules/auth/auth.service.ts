import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import logger from '../../utils/logger';
import EmailService from '../../utils/email';
import { ILoginResponse, ServiceResult, ICreateUserData } from './auth.types';
import { setOTP, getOTP, deleteOTP } from '../../config/redis';

export class AuthService {
  static async register(data: ICreateUserData, createdBy?: string): Promise<ServiceResult> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return { success: false, message: 'Email already exists', statusCode: 409 };
      }

      const userData: any = {
        email: data.email,
        fullName: data.fullName,
        role: data.role?.toUpperCase() || 'VIEWER',
        status: data.status?.toUpperCase() || 'ACTIVE',
      };

      if (createdBy) {
        userData.createdBy = createdBy;
        userData.updatedBy = createdBy;
      }

      const user = await prisma.user.create({
        data: userData
      });

      return { success: true, message: 'User created successfully', data: user };
    } catch (error) {
      logger.error('User creation error:', error);
      return { success: false, message: 'Failed to create user', statusCode: 500 };
    }
  }

  static async requestOTP(email: string): Promise<ServiceResult<{ expiresIn: number }>> {
    try {
      const otp = crypto.randomInt(100000, 999999).toString();
      const expiresIn = parseInt(process.env.OTP_EXPIRY_SECONDS || '300');

      await setOTP(email, otp, expiresIn);

      // Send OTP via email
      const emailSent = await EmailService.sendOTP(email, otp);

      if (!emailSent) {
        logger.warn(`Failed to send OTP email to ${email}, but OTP stored in Redis`);
        // Don't fail the request, just log the warning
      }

      logger.info(`OTP generated for ${email}: ${otp}`);

      return { success: true, message: 'OTP sent successfully', data: { expiresIn } };
    } catch (error) {
      logger.error('OTP request error:', error);
      return { success: false, message: 'Failed to generate OTP', statusCode: 500 };
    }
  }

  static async verifyOTP(email: string, otp: string): Promise<ServiceResult<ILoginResponse>> {
    try {
      const storedOTP = await getOTP(email);

      if (!storedOTP) {
        return { success: false, message: 'OTP not found or expired', statusCode: 400 };
      }

      if (storedOTP !== otp) {
        return { success: false, message: 'Invalid OTP', statusCode: 400 };
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            fullName: email.split('@')[0] || 'User',
            role: 'VIEWER' as any,
            status: 'ACTIVE' as any,
          }
        });
      } else if (user.status !== 'ACTIVE') {
        return { success: false, message: 'Account is inactive', statusCode: 403 };
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Clean up OTP
      await deleteOTP(email);

      const token = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user.id);

      logger.info(`User logged in: ${email}`);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role.toLowerCase() as any,
            status: user.status.toLowerCase() as any,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            createdBy: user.createdBy || undefined,
            updatedBy: user.updatedBy || undefined,
          } as any,
          token,
          refreshToken,
        }
      };
    } catch (error) {
      logger.error('OTP verification error:', error);
      return { success: false, message: 'Authentication failed', statusCode: 500 };
    }
  }

  static async getProfile(userId: string): Promise<ServiceResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, message: 'User not found', statusCode: 404 };
      }

      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role.toLowerCase() as any,
          status: user.status.toLowerCase() as any,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          createdBy: user.createdBy || undefined,
          updatedBy: user.updatedBy || undefined,
        } as any
      };
    } catch (error) {
      logger.error('Profile retrieval error:', error);
      return { success: false, message: 'Failed to retrieve profile', statusCode: 500 };
    }
  }

  static async logout(): Promise<ServiceResult> {
    return { success: true, message: 'Logged out successfully' };
  }

  static async refreshToken(refreshToken: string): Promise<ServiceResult<ILoginResponse>> {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);

      if (!decoded || !decoded.id) {
        return { success: false, message: 'Invalid refresh token', statusCode: 401 };
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || user.status !== 'ACTIVE') {
        return { success: false, message: 'User not found or inactive', statusCode: 401 };
      }

      const newToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user.id);

      logger.info(`Token refreshed for user: ${user.email}`);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role.toLowerCase() as any,
            status: user.status.toLowerCase() as any,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            createdBy: user.createdBy || undefined,
            updatedBy: user.updatedBy || undefined,
          } as any,
          token: newToken,
          refreshToken: newRefreshToken,
        }
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      return { success: false, message: 'Token refresh failed', statusCode: 401 };
    }
  }

  private static generateAccessToken(user: any): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );
  }

  private static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret');
    } catch (error) {
      return null;
    }
  }
}
