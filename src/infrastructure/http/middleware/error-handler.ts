import { Request, Response, NextFunction } from 'express';
import {InvalidCredentialsError, UserAlreadyExistsError} from "@domain/errors";

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof UserAlreadyExistsError) {
        res.status(400).json({ message: error.message });
        return;
    }

    if (error instanceof InvalidCredentialsError) {
        res.status(401).json({ message: error.message });
        return;
    }

    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
}