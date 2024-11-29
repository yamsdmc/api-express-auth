import { GetMeUseCase } from "@application/use-cases/user/get-me";
import { DeleteAccountUseCase } from "@application/use-cases/user/delete-account";
import { NextFunction, Request, Response } from "express";
import { UpdateUserUseCase } from "@application/use-cases/user/update-user";

export class UserController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.getMeUseCase.execute(req.userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { password } = req.body;
      await this.deleteAccountUseCase.execute(req.userId, password);
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { firstname, lastname, password } = req.body;
      await this.updateUserUseCase.execute(req.userId, {
        firstname,
        lastname,
        password,
      });
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      next(error);
    }
  }
}
