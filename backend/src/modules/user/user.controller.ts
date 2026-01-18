import { Response } from 'express';
import { UserService } from './user.service';
import { AuthenticatedRequest } from './user.types';
import { response } from '../../utils/response';
import asyncHandler from '../../utils/asyncHandler';

export class UserController {
  static createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await UserService.createUser(req.body, req.userId);
    if (!result.success) return response.error(res, result.message, result.statusCode);
    return response.created(res, result.message, result.data);
  });

  static getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await UserService.getUserById(id as string);
    if (!result.success) return response.error(res, result.message, result.statusCode);
    return response.success(res, result.message, result.data);
  });

  static updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await UserService.updateUser(id as string, req.body, req.userId);
    if (!result.success) return response.error(res, result.message, result.statusCode);
    return response.success(res, result.message, result.data);
  });

  static deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await UserService.deleteUser(id as string, req.userId);
    if (!result.success) return response.error(res, result.message, result.statusCode);
    return response.success(res, result.message, result.data);
  });

  static listUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await UserService.listUsers(req.query);
    if (!result.success) return response.error(res, result.message, result.statusCode);
    return response.success(res, result.message, result.data);
  });
}
