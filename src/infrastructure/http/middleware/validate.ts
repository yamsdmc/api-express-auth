import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodEffects } from "zod";

export const validate =
  (schema: AnyZodObject | ZodEffects<any, any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Validation started", req.body);
      await schema.parseAsync(req.body);
      console.log("Validation passed");
      next();
    } catch (error: any) {
      console.log("Validation failed", error.errors);
      res.status(400).json({ errors: error.errors });
    }
  };
