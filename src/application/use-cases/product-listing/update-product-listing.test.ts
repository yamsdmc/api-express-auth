import { describe, it, expect, beforeEach } from "vitest";
import { UpdateProductListingUseCase } from "@application/use-cases/product-listing/update-product-listing";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductEntity } from "@domain/entities/Product";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import {
  ListingNotFoundError,
  UnauthorizedListingAccessError,
} from "@domain/errors";

describe("UpdateProductListingUseCase", () => {
  let useCase: UpdateProductListingUseCase;
  let repository: InMemoryProductListingRepository;
  let existingListingId: string;

  const sellerId = "seller-123";
  const otherSellerId = "seller-456";

  const mockProduct: ProductEntity = {
    title: "iPhone 12",
    description: "Excellent condition iPhone",
    price: 500,
    category: "electronics",
    condition: ProductCondition.GOOD,
    images: ["image1.jpg"],
    location: "Paris",
  };

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    useCase = new UpdateProductListingUseCase(repository);

    const listing = await repository.create(sellerId, mockProduct);
    existingListingId = listing.id!;
  });

  it("should update product listing with valid data", async () => {
    const updates = {
      price: 450,
      description: "Price reduced!",
    };

    const updated = await useCase.execute(existingListingId, sellerId, updates);

    expect(updated.product.price).toBe(450);
    expect(updated.product.description).toBe("Price reduced!");
    expect(updated.product.title).toBe(mockProduct.title);
  });

  it("should throw error when listing does not exist", async () => {
    await expect(
      useCase.execute("non-existent-id", sellerId, { price: 450 })
    ).rejects.toThrow("Listing not found");
  });

  it("should throw error when seller is not the owner", async () => {
    await expect(
      useCase.execute(existingListingId, otherSellerId, { price: 450 })
    ).rejects.toThrow("Unauthorized: listing does not belong to seller");
  });

  it("should maintain original data for unmodified fields", async () => {
    const updates = { price: 450 };
    const updated = await useCase.execute(existingListingId, sellerId, updates);

    expect(updated.product).toMatchObject({
      ...mockProduct,
      price: 450,
    });
  });

  it("should update updatedAt timestamp", async () => {
    const original = await repository.findById(existingListingId);
    const originalUpdatedAt = original!.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 1)); // petit délai

    const updated = await useCase.execute(existingListingId, sellerId, {
      price: 450,
    });
    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      originalUpdatedAt.getTime()
    );
  });
  it("should throw ListingNotFoundError when listing does not exist", async () => {
    await expect(
      useCase.execute("non-existent-id", sellerId, { price: 450 })
    ).rejects.toThrow(ListingNotFoundError);
  });

  it("should throw UnauthorizedListingAccessError when seller is not the owner", async () => {
    await expect(
      useCase.execute(existingListingId, otherSellerId, { price: 450 })
    ).rejects.toThrow(UnauthorizedListingAccessError);
  });
});
