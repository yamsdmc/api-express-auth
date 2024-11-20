import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductEntity } from "@domain/entities/Product";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";

describe("InMemoryProductListingRepository", () => {
  let repository: InMemoryProductListingRepository;
  const sellerId = "seller-123";

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
    await repository.reset();
  });

  describe("create", () => {
    it("should create a new listing with generated IDs", async () => {
      const listing = await repository.create(sellerId, mockProduct);

      expect(listing.id).toBeDefined();
      expect(listing.product.id).toBeDefined();
      expect(listing.sellerId).toBe(sellerId);
      expect(listing.product.title).toBe(mockProduct.title);
      expect(listing.createdAt).toBeInstanceOf(Date);
      expect(listing.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("findById", () => {
    it("should return null for non-existent listing", async () => {
      const listing = await repository.findById("non-existent");
      expect(listing).toBeNull();
    });

    it("should find listing by id", async () => {
      const created = await repository.create(sellerId, mockProduct);
      const found = await repository.findById(created.id!);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });
  });

  describe("findBySellerId", () => {
    it("should return empty array for seller with no listings", async () => {
      const listings = await repository.findBySellerId("non-existent");
      expect(listings).toHaveLength(0);
    });

    it("should find all listings for a seller", async () => {
      await repository.create(sellerId, mockProduct);
      await repository.create(sellerId, { ...mockProduct, title: "iPhone 13" });

      const listings = await repository.findBySellerId(sellerId);

      expect(listings).toHaveLength(2);
      expect(listings.every((l) => l.sellerId === sellerId)).toBe(true);
    });
  });

  describe("update", () => {
    it("should throw error for non-existent listing", async () => {
      await expect(
        repository.update("non-existent", { price: 600 })
      ).rejects.toThrow("Listing not found");
    });

    it("should update product data", async () => {
      const created = await repository.create(sellerId, mockProduct);
      const updated = await repository.update(created.id!, { price: 600 });

      expect(updated.product.price).toBe(600);
      expect(updated.updatedAt).not.toBe(created.updatedAt);
      expect(updated.product.title).toBe(mockProduct.title);
    });
  });

  describe("delete", () => {
    it("should throw error for non-existent listing", async () => {
      await expect(repository.delete("non-existent")).rejects.toThrow(
        "Listing not found"
      );
    });

    it("should delete listing", async () => {
      const created = await repository.create(sellerId, mockProduct);
      await repository.delete(created.id!);

      const found = await repository.findById(created.id!);
      expect(found).toBeNull();
    });
  });
});
