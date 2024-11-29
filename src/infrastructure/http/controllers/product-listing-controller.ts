import { CreateProductListingUseCase } from "@application/use-cases/product-listing/create-product-listing";
import { GetSellerListingsUseCase } from "@application/use-cases/product-listing/get-seller-listings";
import { UpdateProductListingUseCase } from "@application/use-cases/product-listing/update-product-listing";
import { DeleteProductListingUseCase } from "@application/use-cases/product-listing/delete-product-listing";
import { NextFunction, Request, Response } from "express";
import { GetListingByIdUseCase } from "@application/use-cases/product-listing/get-listing-by-id";
import { GetListingsUseCase } from "@application/use-cases/product-listing/get-listings";

export class ProductListingController {
  constructor(
    private readonly createProductListingUseCase: CreateProductListingUseCase,
    private readonly getSellerListingsUseCase: GetSellerListingsUseCase,
    private readonly updateProductListingUseCase: UpdateProductListingUseCase,
    private readonly deleteProductListingUseCase: DeleteProductListingUseCase,
    private readonly getListingByIdUseCase: GetListingByIdUseCase,
    private readonly getListingsUseCase: GetListingsUseCase
  ) {}

  async getListings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log("getListings");
    try {
      const filters = {
        category: req.query.category as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };

      const listings = await this.getListingsUseCase.execute(filters);
      res.json(listings);
    } catch (error) {
      next(error);
    }
  }

  async createListing(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log("createListing");
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
      console.log(listings, null, 2);
      res.json(listings);
    } catch (error) {
      next(error);
    }
  }

  async getSellerListingCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sellerId = req.userId;
      const count =
        await this.getSellerListingsUseCase.countSellerListings(sellerId);
      res.json({ count });
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
      console.log("getListingById -> id", id);
      const listing = await this.getListingByIdUseCase.execute(id);
      res.json(listing);
    } catch (error) {
      next(error);
    }
  }
}