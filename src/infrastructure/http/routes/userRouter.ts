import { Router } from "express";
import {
  deleteAccountSchema,
  updateUserSchema,
} from "@application/validators/auth-validator";
import { validate } from "../middleware/validate";
import { authMiddleware } from "@infrastructure/http/middleware/auth-middleware";
import { TokenBlacklistService } from "@domain/services/token-blacklist";
import { TokenService } from "@application/services/token-service";
import { UserController } from "@infrastructure/http/controllers/user-controller";

export const userRouter = (
  userController: UserController,
  tokenService: TokenService,
  blacklistService: TokenBlacklistService
): Router => {
  const router = Router();

  /**
   * @openapi
   * /api/users/me:
   *   get:
   *     tags:
   *       - User
   *     security:
   *       - bearerAuth: []
   *     summary: Get current user information
   *     responses:
   *       200:
   *         description: User information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  router.get(
    "/me",
    authMiddleware(tokenService, blacklistService),
    async (req, res, next) => userController.getMe(req, res, next)
  );

  /**
   * @openapi
   * /api/users/me:
   *   patch:
   *     tags:
   *       - User
   *     security:
   *       - bearerAuth: []
   *     summary: Update current user information
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - firstname
   *               - lastname
   *             properties:
   *               firstname:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *                 description: User's first name
   *               lastname:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *                 description: User's last name
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 maxLength: 100
   *                 pattern: ^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$
   *                 description: Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
   *             additionalProperties: false
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Validation error: Password must contain at least one uppercase letter"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  router.patch(
    "/me",
    authMiddleware(tokenService, blacklistService),
    validate(updateUserSchema),
    userController.updateUser
  );

  /**
   * @openapi
   * /api/users/delete-account:
   *   delete:
   *     tags:
   *       - User
   *     security:
   *       - bearerAuth: []
   *     summary: Delete user account
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Account deleted successfully
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       400:
   *         description: Invalid password
   */
  router.delete(
    "/delete-account",
    validate(deleteAccountSchema),
    authMiddleware(tokenService, blacklistService),
    (req, res, next) => userController.deleteAccount(req, res, next)
  );

  return router;
};
