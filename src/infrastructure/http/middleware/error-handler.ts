import { Request, Response, NextFunction } from "express";
import { ApplicationError } from "@domain/errors";
import * as console from "node:console";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("error", error);
  if (error instanceof ApplicationError) {
    res.status(error.status).json({
      code: error.code,
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    code: "SERVER_001",
    message: "Internal server error",
  });
}
