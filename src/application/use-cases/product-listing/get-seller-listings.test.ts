import { describe, it, expect, beforeEach } from "vitest";
import { GetSellerListingsUseCase } from "@application/use-cases/product-listing/get-seller-listings";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import {
  createValidProduct,
  createValidProductListing,
} from "./factories/productListing.factory";
import { ProductCategory, ProductSubcategory } from "@domain/value-concepts/ProductCategory";

describe("GetSellerListingsUseCase", () => {
  let useCase: GetSellerListingsUseCase;
  let repository: InMemoryProductListingRepository;
  const sellerId = "seller-123";
  const otherSellerId = "seller-456";

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    useCase = new GetSellerListingsUseCase(repository);

    await repository.create(
      createValidProductListing({
        sellerId,
        product: createValidProduct({ 
          title: "iPhone 12",
          category: ProductCategory.ELECTRONICS,
          subcategory: ProductSubcategory.SMARTPHONES_TABLETS
        }),
      })
    );
    await repository.create(
      createValidProductListing({
        sellerId,
        product: createValidProduct({ 
          title: "iPhone 13",
          category: ProductCategory.ELECTRONICS,
          subcategory: ProductSubcategory.SMARTPHONES_TABLETS
        }),
      })
    );
    await repository.create(
      createValidProductListing({
        sellerId: otherSellerId,
        product: createValidProduct({ 
          title: "Macbook pro",
          category: ProductCategory.ELECTRONICS,
          subcategory: ProductSubcategory.COMPUTERS_LAPTOPS
        }),
      })
    );
  });

  describe("execute", () => {
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
        "iPhone 13"
      );
      
      // Verify category and subcategory are present
      listings.forEach(listing => {
        expect(listing.product.category).toBeDefined();
        expect(listing.product.subcategory).toBeDefined();
      });
    });

    it("should return empty array for seller with no listings", async () => {
      const listings = await useCase.execute("non-existent-seller");
      expect(listings).toHaveLength(0);
    });

    it("should not return listings from other sellers", async () => {
      const listings = await useCase.execute(sellerId);

      const otherSellerProducts = listings.filter(
        (listing) => listing.product.title === "Macbook pro"
      );
      expect(otherSellerProducts).toHaveLength(0);
    });

    it("should return listings with proper structure including categories", async () => {
      const listings = await useCase.execute(sellerId);

      listings.forEach(listing => {
        expect(listing.product).toMatchObject({
          title: expect.any(String),
          category: expect.any(String),
          subcategory: expect.any(String),
          price: expect.any(Number),
          condition: expect.any(String),
        });
      });
    });
  });

  describe("countSellerListings", () => {
    it("should return the number of listings for a specific seller", async () => {
      const count = await useCase.countSellerListings(sellerId);
      expect(count).toBe(2);
    });
    
    it("should return 0 for a seller with no listings", async () => {
      const count = await useCase.countSellerListings("non-existent-seller");
      expect(count).toBe(0);
    });
  });
});
