import { describe, it, expect, beforeEach } from "vitest";
import { GetListingByIdUseCase } from "@application/use-cases/product-listing/get-listing-by-id";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { ListingNotFoundError } from "@domain/errors";

describe("GetListingByIdUseCase", () => {
  let useCase: GetListingByIdUseCase;
  let repository: InMemoryProductListingRepository;
  let existingListingId: string;

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

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    useCase = new GetListingByIdUseCase(repository);

    const listing = await repository.create("seller-123", mockProduct);
    existingListingId = listing.id!;
  });

  it("should return listing for valid id", async () => {
    const listing = await useCase.execute(existingListingId);

    expect(listing).toBeDefined();
    expect(listing.id).toBe(existingListingId);
    expect(listing.product.title).toBe(mockProduct.title);
  });

  it("should throw ListingNotFoundError for non-existent id", async () => {
    await expect(useCase.execute("non-existent-id")).rejects.toThrow(
      ListingNotFoundError
    );
  });
});
