import { Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { AuthenticatedRequest } from '../modules/auth/auth.types';
import { response } from '../utils/response';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header if cookie not present
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return response.unauthorized(res, 'Access token required');
    }

    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return response.unauthorized(res, 'Invalid or expired token');
    }

    req.userId = decoded.id;
    req.user = decoded;

    next();
  } catch (error) {
    return response.unauthorized(res, 'Authentication failed');
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return response.unauthorized(res, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return response.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};
