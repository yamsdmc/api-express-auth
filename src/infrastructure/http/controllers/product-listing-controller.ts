import { CreateProductListingUseCase } from "@application/use-cases/product-listing/create-product-listing";
import { GetSellerListingsUseCase } from "@application/use-cases/product-listing/get-seller-listings";
import { UpdateProductListingUseCase } from "@application/use-cases/product-listing/update-product-listing";
import { DeleteProductListingUseCase } from "@application/use-cases/product-listing/delete-product-listing";
import { NextFunction, Request, Response } from "express";
import { GetListingByIdUseCase } from "@application/use-cases/product-listing/get-listing-by-id";

export class ProductListingController {
  constructor(
    private readonly createProductListingUseCase: CreateProductListingUseCase,
    private readonly getSellerListingsUseCase: GetSellerListingsUseCase,
    private readonly updateProductListingUseCase: UpdateProductListingUseCase,
    private readonly deleteProductListingUseCase: DeleteProductListingUseCase,
    private readonly getListingByIdUseCase: GetListingByIdUseCase
  ) {}

  async createListing(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sellerId = req.userId;
      const listing = await this.createProductListingUseCase.execute(
        sellerId,
        req.body
      );
      res.status(201).json(listing);
    } catch (error) {
      next(error);
    }
  }

  async getSellerListings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sellerId = req.userId;
      const listings = await this.getSellerListingsUseCase.execute(sellerId);
      res.json(listings);
    } catch (error) {
      next(error);
    }
  }

  async updateListing(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sellerId = req.userId;
      const { id } = req.params;
      const listing = await this.updateProductListingUseCase.execute(
        id,
        sellerId,
        req.body
      );
      res.json(listing);
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sellerId = req.userId;
      const { id } = req.params;
      await this.deleteProductListingUseCase.execute(id, sellerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  async getListingById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const listing = await this.getListingByIdUseCase.execute(id);
      res.json(listing);
    } catch (error) {
      next(error);
    }
  }
}
