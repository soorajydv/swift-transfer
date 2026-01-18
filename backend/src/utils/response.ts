interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: any;
}

export class response {
  static success<T = any>(res: any,message: string,data?: T,pagination?: any,statusCode = 200): any {
    const response: ApiResponse<T> = { success: true, message };
    if (data !== undefined) response.data = data;
    if (pagination) response.pagination = pagination;
    return res.status(statusCode).json(response);
  }

  static created<T = any>(res: any,message: string,data: T): any {
    return this.success(res, message, data, undefined, 201);
  }

  static noContent(res: any, message = 'No content'): any {
    return res.status(204).json({ success: true, message, data: null });
  }

  static error(res: any, message: string, statusCode = 500, errors?: any): any {
    const response: ApiResponse = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  static badRequest(res: any,message: string,errors?: any): any {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: any,message = 'Unauthorized'): any {
    return this.error(res, message, 401);
  }

  static forbidden(res: any,message = 'Forbidden'): any {
    return this.error(res, message, 403);
  }

  static notFound(res: any,message = 'Not found'): any {
    return this.error(res, message, 404);
  }

  static conflict(res: any,message = 'Conflict'): any {
    return this.error(res, message, 409);
  }

  static internalServerError(res: any,message = 'Internal server error'): any {
    return this.error(res, message, 500);
  }
}
