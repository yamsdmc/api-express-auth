import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { ProductListingController } from "@infrastructure/http/controllers/product-listing-controller";
import { CreateProductListingUseCase } from "@application/use-cases/product-listing/create-product-listing";
import { GetSellerListingsUseCase } from "@application/use-cases/product-listing/get-seller-listings";
import { GetListingByIdUseCase } from "@application/use-cases/product-listing/get-listing-by-id";
import { UpdateProductListingUseCase } from "@application/use-cases/product-listing/update-product-listing";
import { DeleteProductListingUseCase } from "@application/use-cases/product-listing/delete-product-listing";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { GetListingsUseCase } from "@application/use-cases/product-listing/get-listings";

describe("ProductListingController", () => {
  let controller: ProductListingController;
  let mockCreateUseCase: CreateProductListingUseCase;
  let mockGetSellerListingsUseCase: GetSellerListingsUseCase;
  let mockGetListingByIdUseCase: GetListingByIdUseCase;
  let mockUpdateUseCase: UpdateProductListingUseCase;
  let mockDeleteUseCase: DeleteProductListingUseCase;
  let mockGetListingsUseCase: GetListingsUseCase;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: any;

  const mockProduct = {
    title: "iPhone 12",
    description:
      "This is a valid description that meets the minimum length requirement",
    price: 500,
    category: "electronics",
    condition: ProductCondition.GOOD,
    images: ["image1.jpg"],
    location: "Paris",
  };

  beforeEach(() => {
    mockCreateUseCase = {
      execute: vi.fn(),
    } as unknown as CreateProductListingUseCase;

    mockGetSellerListingsUseCase = {
      execute: vi.fn(),
    } as unknown as GetSellerListingsUseCase;

    mockGetListingByIdUseCase = {
      execute: vi.fn(),
    } as unknown as GetListingByIdUseCase;

    mockUpdateUseCase = {
      execute: vi.fn(),
    } as unknown as UpdateProductListingUseCase;

    mockDeleteUseCase = {
      execute: vi.fn(),
    } as unknown as DeleteProductListingUseCase;
    mockGetListingsUseCase = {
      execute: vi.fn(),
    } as unknown as GetListingsUseCase;

    mockResponse = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };

    mockNext = vi.fn();

    controller = new ProductListingController(
      mockCreateUseCase,
      mockGetSellerListingsUseCase,
      mockUpdateUseCase,
      mockDeleteUseCase,
      mockGetListingByIdUseCase,
      mockGetListingsUseCase
    );
  });

  describe("createListing", () => {
    beforeEach(() => {
      mockRequest = {
        userId: "user-123",
        body: mockProduct,
      };
    });

    it("should create listing successfully", async () => {
      const expectedListing = { id: "listing-123", ...mockProduct };
      mockCreateUseCase.execute = vi.fn().mockResolvedValue(expectedListing);

      await controller.createListing(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(
        "user-123",
        mockProduct
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedListing);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      mockCreateUseCase.execute = vi.fn().mockRejectedValue(error);

      await controller.createListing(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getListingById", () => {
    beforeEach(() => {
      mockRequest = {
        params: { id: "listing-123" },
      };
    });

    it("should return listing successfully", async () => {
      const expectedListing = { id: "listing-123", ...mockProduct };
      mockGetListingByIdUseCase.execute = vi
        .fn()
        .mockResolvedValue(expectedListing);

      await controller.getListingById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetListingByIdUseCase.execute).toHaveBeenCalledWith(
        "listing-123"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedListing);
    });

    it("should handle errors", async () => {
      const error = new Error("Test error");
      mockGetListingByIdUseCase.execute = vi.fn().mockRejectedValue(error);

      await controller.getListingById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getSellerListings", () => {
    beforeEach(() => {
      mockRequest = {
        userId: "user-123",
      };
    });

    it("should return seller listings successfully", async () => {
      const expectedListings = [
        { id: "listing-1", ...mockProduct },
        { id: "listing-2", ...mockProduct },
      ];
      mockGetSellerListingsUseCase.execute = vi
        .fn()
        .mockResolvedValue(expectedListings);

      await controller.getSellerListings(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetSellerListingsUseCase.execute).toHaveBeenCalledWith(
        "user-123"
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedListings);
    });
  });

  describe("updateListing", () => {
    beforeEach(() => {
      mockRequest = {
        userId: "user-123",
        params: { id: "listing-123" },
        body: { price: 600 },
      };
    });

    it("should update listing successfully", async () => {
      const expectedListing = {
        id: "listing-123",
        ...mockProduct,
        price: 600,
      };
      mockUpdateUseCase.execute = vi.fn().mockResolvedValue(expectedListing);

      await controller.updateListing(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith(
        "listing-123",
        "user-123",
        { price: 600 }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedListing);
    });
  });

  describe("deleteListing", () => {
    beforeEach(() => {
      mockRequest = {
        userId: "user-123",
        params: { id: "listing-123" },
      };
    });

    it("should delete listing successfully", async () => {
      mockDeleteUseCase.execute = vi.fn().mockResolvedValue(undefined);

      await controller.deleteListing(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith(
        "listing-123",
        "user-123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });
});
