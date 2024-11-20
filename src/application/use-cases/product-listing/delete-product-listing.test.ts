import { describe, it, expect, beforeEach } from "vitest";
import {
  ListingNotFoundError,
  UnauthorizedListingAccessError,
} from "@domain/errors";
import { DeleteProductListingUseCase } from "@application/use-cases/product-listing/delete-product-listing";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";

describe("DeleteProductListingUseCase", () => {
  let useCase: DeleteProductListingUseCase;
  let repository: InMemoryProductListingRepository;
  let existingListingId: string;

  const sellerId = "seller-123";
  const otherSellerId = "seller-456";

  const mockProduct = {
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
    useCase = new DeleteProductListingUseCase(repository);

    const listing = await repository.create(sellerId, mockProduct);
    existingListingId = listing.id!;
  });

  it("should delete an existing listing", async () => {
    await useCase.execute(existingListingId, sellerId);

    const deletedListing = await repository.findById(existingListingId);
    expect(deletedListing).toBeNull();
  });

  it("should throw ListingNotFoundError when listing does not exist", async () => {
    await expect(useCase.execute("non-existent-id", sellerId)).rejects.toThrow(
      ListingNotFoundError
    );
  });

  it("should throw UnauthorizedListingAccessError when seller is not the owner", async () => {
    await expect(
      useCase.execute(existingListingId, otherSellerId)
    ).rejects.toThrow(UnauthorizedListingAccessError);
  });

  it("should not delete other sellers listings", async () => {
    const otherListing = await repository.create(otherSellerId, {
      ...mockProduct,
      title: "Other product",
    });

    await expect(useCase.execute(otherListing.id!, sellerId)).rejects.toThrow(
      UnauthorizedListingAccessError
    );

    const listing = await repository.findById(otherListing.id!);
    expect(listing).not.toBeNull();
  });
});
