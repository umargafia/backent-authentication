import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';
import { IUser } from '../models/User';

export class AuthService {
  static signToken(id: string): string {
    return jwt.sign({ id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    }) as string;
  }

  static createSendToken(user: IUser, statusCode: number, res: Response) {
    const token = this.signToken(user._id.toString());

    // Remove password from output
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user: userWithoutPassword,
      },
    });
  }

  static verifyToken(token: string): { id: string; iat: number; exp: number } {
    return jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      iat: number;
      exp: number;
    };
  }
}
