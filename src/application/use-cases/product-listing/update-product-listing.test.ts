import { describe, it, expect, beforeEach } from "vitest";
import { UpdateProductListingUseCase } from "@application/use-cases/product-listing/update-product-listing";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import {
  ListingNotFoundError,
  UnauthorizedListingAccessError,
} from "@domain/errors";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import {
  createValidProduct,
  createValidProductListing,
} from "./factories/productListing.factory";

describe("UpdateProductListingUseCase", () => {
  let useCase: UpdateProductListingUseCase;
  let repository: InMemoryProductListingRepository;
  let existingListingId: string;

  const sellerId = "seller-123";
  const otherSellerId = "seller-456";

  const mockListing: ProductListingEntity = createValidProductListing({
    sellerId,
  });

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    useCase = new UpdateProductListingUseCase(repository);

    const listing = await repository.create(mockListing);
    existingListingId = listing.id!;
  });

  it("should update product listing with valid data", async () => {
    const updates = createValidProductListing({
      ...mockListing,
      product: createValidProduct({
        price: 450,
        description: "Price reduced!",
      }),
    });

    const updated = await useCase.execute(existingListingId, sellerId, updates);

    expect(updated.product.price).toBe(450);
    expect(updated.product.description).toBe("Price reduced!");
    expect(updated.product.title).toBe(mockListing.product.title);
  });

  it("should throw error when listing does not exist", async () => {
    const partialListing: Partial<ProductListingEntity> = {
      product: createValidProduct({
        price: 450,
      }),
    };

    await expect(
      useCase.execute("non-existent-id", sellerId, partialListing)
    ).rejects.toThrow("Listing not found");
  });

  it("should throw error when seller is not the owner", async () => {
    const partialListing: Partial<ProductListingEntity> = {
      product: createValidProduct({
        price: 450,
      }),
    };
    await expect(
      useCase.execute(existingListingId, otherSellerId, partialListing)
    ).rejects.toThrow("Unauthorized: listing does not belong to seller");
  });

  it("should maintain original data for unmodified fields", async () => {
    const partialListing: Partial<ProductListingEntity> = {
      product: createValidProduct({
        price: 450,
      }),
    };
    const updated = await useCase.execute(
      existingListingId,
      sellerId,
      partialListing
    );

    expect(updated.product).toMatchObject({
      ...mockListing.product,
      price: 450,
    });
  });

  it("should update updatedAt timestamp", async () => {
    const original = await repository.findById(existingListingId);
    const originalUpdatedAt = original!.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 1));
    const partialListing: Partial<ProductListingEntity> = {
      product: createValidProduct({
        price: 450,
      }),
    };
    const updated = await useCase.execute(
      existingListingId,
      sellerId,
      partialListing
    );
    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      originalUpdatedAt.getTime()
    );
  });
  it("should throw ListingNotFoundError when listing does not exist", async () => {
    const partialListing: Partial<ProductListingEntity> = {
      product: createValidProduct({
        price: 450,
      }),
    };
    await expect(
      useCase.execute("non-existent-id", sellerId, partialListing)
    ).rejects.toThrow(ListingNotFoundError);
  });

  it("should throw UnauthorizedListingAccessError when seller is not the owner", async () => {
    const partialListing: Partial<ProductListingEntity> = {
      product: createValidProduct({
        price: 450,
      }),
    };
    await expect(
      useCase.execute(existingListingId, otherSellerId, partialListing)
    ).rejects.toThrow(UnauthorizedListingAccessError);
  });
});
