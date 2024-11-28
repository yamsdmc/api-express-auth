import { describe, it, expect, beforeEach } from "vitest";
import { GetSellerListingsUseCase } from "@application/use-cases/product-listing/get-seller-listings";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { createValidProduct, createValidProductListing } from "./factories/productListing.factory";

describe("GetSellerListingsUseCase", () => {
  let useCase: GetSellerListingsUseCase;
  let repository: InMemoryProductListingRepository;
  const sellerId = "seller-123";
  const otherSellerId = "seller-456";

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    useCase = new GetSellerListingsUseCase(repository);
  
    await repository.create(createValidProductListing({
      sellerId,
      product: createValidProduct({title: "iPhone 12"})
    }));
    await repository.create(createValidProductListing({
      sellerId,
      product: createValidProduct({title: "iPhone 13"})
    }));
    await repository.create(createValidProductListing({
      sellerId: otherSellerId,
      product: createValidProduct({title: "Macbook pro"})
    }));
  });

  it("should return all listings for a specific seller", async () => {
    const listings = await useCase.execute(sellerId);

    expect(listings).toHaveLength(2);
    console.log(listings)
    expect(listings.every((listing) => listing.sellerId === sellerId)).toBe(
      true
    );
    expect(listings.map((listing) => listing.product.title)).toContain(
      "iPhone 12"
    );
    expect(listings.map((listing) => listing.product.title)).toContain(
      "iPhone 13"
    );
  });

  it("should return empty array for seller with no listings", async () => {
    const listings = await useCase.execute("non-existent-seller");
    expect(listings).toHaveLength(0);
  });

  it("should not return listings from other sellers", async () => {
    const listings = await useCase.execute(sellerId);

    const otherSellerProducts = listings.filter(
      (listing) => listing.product.title === "Samsung Galaxy"
    );
    expect(otherSellerProducts).toHaveLength(0);
  });
});
