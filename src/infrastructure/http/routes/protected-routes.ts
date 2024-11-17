import { TokenService } from "@application/services/token-service";
import { Router } from "express";

export const protectedRouter = (tokenService: TokenService): Router => {
  const router = Router();

  router.get("/profile", (req, res) => {
    res.json({
      message: "Protected route",
      userId: req.userId,
    });
  });

  return router;
};
