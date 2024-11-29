import { CreateProductListingUseCase } from "@application/use-cases/product-listing/create-product-listing";
import { GetSellerListingsUseCase } from "@application/use-cases/product-listing/get-seller-listings";
import { UpdateProductListingUseCase } from "@application/use-cases/product-listing/update-product-listing";
import { DeleteProductListingUseCase } from "@application/use-cases/product-listing/delete-product-listing";
import { NextFunction, Request, Response } from "express";
import { GetListingByIdUseCase } from "@application/use-cases/product-listing/get-listing-by-id";
import {
  GetListingsParams,
  GetListingsUseCase,
} from "@application/use-cases/product-listing/get-listings";
import { ProductCategoryType } from "@domain/value-concepts/ProductCategory";
import { ListingFilters } from "@domain/value-concepts/ListingFilters";

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
    try {
      const pagination = {
        offset: parseInt(req.query.offset as string) || 0,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const filters: ListingFilters = {
        category: req.query.category
          ? (req.query.category as ProductCategoryType)
          : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      };

      const listings = await this.getListingsUseCase.execute({
        pagination,
        filters,
      });

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
      const listing = await this.getListingByIdUseCase.execute(id);
      res.json(listing);
    } catch (error) {
      next(error);
    }
  }
}
