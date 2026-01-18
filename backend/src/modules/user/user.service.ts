import prisma from '../../config/prisma';
import { ICreateUserData, IUpdateUserData, ServiceResult } from './user.types';
import { paginatePrisma } from '../../utils/pagination';

export class UserService {
  static async createUser(data: ICreateUserData, createdBy?: string): Promise<ServiceResult> {
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
      console.error('User creation error:', error);
      return { success: false, message: 'Failed to create user', statusCode: 500 };
    }
  }

  static async getUserById(id: string): Promise<ServiceResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return { success: false, message: 'User not found', statusCode: 404 };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          createdBy: user.createdBy || undefined,
          updatedBy: user.updatedBy || undefined,
        }
      };
    } catch (error) {
      console.error('User retrieval error:', error);
      return { success: false, message: 'Failed to retrieve user', statusCode: 500 };
    }
  }

  static async updateUser(id: string, data: IUpdateUserData, updatedBy?: string): Promise<ServiceResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return { success: false, message: 'User not found', statusCode: 404 };
      }

      if (data.email && data.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email }
        });
        if (existingUser) {
          return { success: false, message: 'Email already exists', statusCode: 409 };
        }
      }

      const updateData: any = {};
      if (data.email !== undefined) updateData.email = data.email;
      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.role !== undefined) updateData.role = data.role.toUpperCase();
      if (data.status !== undefined) updateData.status = data.status.toUpperCase();
      if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          status: updatedUser.status,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          createdBy: updatedUser.createdBy || undefined,
          updatedBy: updatedUser.updatedBy || undefined,
        }
      };
    } catch (error) {
      console.error('User update error:', error);
      return { success: false, message: 'Failed to update user', statusCode: 500 };
    }
  }

  static async deleteUser(id: string, updatedBy?: string): Promise<ServiceResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return { success: false, message: 'User not found', statusCode: 404 };
      }

      const updateData: any = { status: 'INACTIVE' };
      if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

      await prisma.user.update({
        where: { id },
        data: updateData
      });

      return { success: true, message: 'User deactivated successfully' };
    } catch (error) {
      console.error('User deletion error:', error);
      return { success: false, message: 'Failed to delete user', statusCode: 500 };
    }
  }

  static async listUsers(query: any): Promise<ServiceResult> {
    try {
      const { page = 1, limit = 10, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (role) where.role = role.toUpperCase();
      if (status) where.status = status.toUpperCase();

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder.toLowerCase();

      const result = await paginatePrisma(
        prisma.user,
        where,
        { page: Number(page), limit: Number(limit) },
        orderBy
      );

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: result.data.map((user: any) => ({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            createdBy: user.createdBy || undefined,
            updatedBy: user.updatedBy || undefined,
          })),
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('User list error:', error);
      return { success: false, message: 'Failed to retrieve users', statusCode: 500 };
    }
  }
}
