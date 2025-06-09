export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export function createApiError(error: { code: string; message: string; details?: any }): ApiError {
  return error;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export type ActionState<T = any> = {
  error?: {
    code: string;
    message: string;
  };
} | T;