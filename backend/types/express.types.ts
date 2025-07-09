import type { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  error: {
    status: number;
    message: string;
    stack?: string;
  };
}

export interface AppError extends Error {
  status?: number;
}

export type ErrorHandler = (
  err: AppError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => void;

export type NotFoundHandler = (
  req: Request,
  res: Response<ErrorResponse>
) => void;

export type RouteHandler = (req: Request, res: Response) => void | Promise<void>;
