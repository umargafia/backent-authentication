import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

interface MongoError extends Error {
  code?: number;
}

export const errorHandler = (
  err: Error | AppError | MongoError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((error) => error.message);
    res.status(400).json({
      status: 'error',
      message: messages.join('. '),
    });
  } else if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      status: 'error',
      message: `Invalid ${err.path}: ${err.value}`,
    });
  } else if ((err as MongoError).code === 11000) {
    res.status(400).json({
      status: 'error',
      message: 'Duplicate field value entered',
    });
  } else {
    // Handle unknown errors
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};
