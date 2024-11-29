import { describe, it, expect, beforeEach } from "vitest";
import {
  ListingNotFoundError,
  UnauthorizedListingAccessError,
} from "@domain/errors";
import { DeleteProductListingUseCase } from "@application/use-cases/product-listing/delete-product-listing";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import {
  createValidProduct,
  createValidProductListing,
} from "./factories/productListing.factory";

describe("DeleteProductListingUseCase", () => {
  let useCase: DeleteProductListingUseCase;
  let repository: InMemoryProductListingRepository;
  let existingListingId: string;

  const sellerId = "seller-123";
  const otherSellerId = "seller-456";

  const mockListing: ProductListingEntity = createValidProductListing({
    sellerId,
  });

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    useCase = new DeleteProductListingUseCase(repository);

    const listing = await repository.create(mockListing);
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
    const mockListing: ProductListingEntity = createValidProductListing({
      sellerId: otherSellerId,
      product: createValidProduct({ title: "iPhone 15 pro" }),
    });

    const createdListing = await repository.create(mockListing);

    await expect(useCase.execute(createdListing.id!, sellerId)).rejects.toThrow(
      UnauthorizedListingAccessError
    );

    const listing = await repository.findById(createdListing.id!);
    expect(listing).not.toBeNull();
  });
});
