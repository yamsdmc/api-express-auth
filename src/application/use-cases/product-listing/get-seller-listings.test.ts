import { describe, it, expect, beforeEach } from "vitest";
import { GetSellerListingsUseCase } from "@application/use-cases/product-listing/get-seller-listings";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductEntity } from "@domain/entities/Product";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";

describe("GetSellerListingsUseCase", () => {
  let useCase: GetSellerListingsUseCase;
  let repository: InMemoryProductListingRepository;
  const sellerId = "seller-123";
  const otherSellerId = "seller-456";

  const createMockProduct = (title: string): ProductEntity => ({
    title,
    description: "Product description",
    price: 500,
    category: "electronics",
    condition: ProductCondition.GOOD,
    images: ["image1.jpg"],
    location: "Paris",
  });

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    useCase = new GetSellerListingsUseCase(repository);

    await repository.create(sellerId, createMockProduct("iPhone 12"));
    await repository.create(sellerId, createMockProduct("MacBook Pro"));
    await repository.create(otherSellerId, createMockProduct("Samsung Galaxy"));
  });

  it("should return all listings for a specific seller", async () => {
    const listings = await useCase.execute(sellerId);

    expect(listings).toHaveLength(2);
    expect(listings.every((listing) => listing.sellerId === sellerId)).toBe(
      true
    );
    expect(listings.map((listing) => listing.product.title)).toContain(
      "iPhone 12"
    );
    expect(listings.map((listing) => listing.product.title)).toContain(
      "MacBook Pro"
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
