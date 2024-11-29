import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodEffects } from "zod";

export const validate =
  (schema: AnyZodObject | ZodEffects<any, any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({ errors: error.errors });
    }
  };
