import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './auth.types';
import { response } from '../../utils/response';
import asyncHandler from '../../utils/asyncHandler';

export class AuthController {
  static register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.register(req.body);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static requestOTP = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.body;
    const result = await AuthService.requestOTP(email);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static verifyOTP = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyOTP(email, otp);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    const { user, token, refreshToken } = result.data!;

    // Set HTTP-only cookies
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return response.success(res, result.message, { user });
  });

  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId) {
      return response.unauthorized(res, 'User not authenticated');
    }

    const result = await AuthService.getProfile(req.userId);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    return response.success(res, result.message, result.data);
  });

  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await AuthService.logout();

    // Clear authentication cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return response.success(res, result.message);
  });

  static refresh = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return response.unauthorized(res, 'Refresh token not provided');
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (!result.success) {
      return response.error(res, result.message, result.statusCode);
    }

    const { user, token, refreshToken: newRefreshToken } = result.data!;

    // Set new HTTP-only cookies
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return response.success(res, result.message, { user });
  });
}
