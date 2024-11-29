import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductEntity } from "@domain/entities/Product";
import { ListingFilters } from "@domain/value-concepts/ListingFilters";
import { ProductCategory } from "@domain/value-concepts/ProductCategory";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import {
  createValidProduct,
  createValidProductListing,
} from "@application/use-cases/product-listing/factories/productListing.factory";

describe("InMemoryProductListingRepository", () => {
  let repository: InMemoryProductListingRepository;
  const sellerId = "seller-123";

  const mockListing: ProductListingEntity = createValidProductListing({
    sellerId,
  });

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    await repository.reset();
  });

  describe("create", () => {
    it("should create a new listing with generated IDs", async () => {
      const listing = await repository.create(mockListing);

      expect(listing.id).toBeDefined();
      expect(listing.product.id).toBeDefined();
      expect(listing.sellerId).toBe(sellerId);
      expect(listing.product.title).toBe(mockListing.product.title);
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
      const created = await repository.create(mockListing);
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
      await repository.create(mockListing);

      await repository.create(
        createValidProductListing({
          sellerId,
          product: createValidProduct({ title: "macbook PRO" }),
        })
      );

      const listings = await repository.findBySellerId(sellerId);

      expect(listings).toHaveLength(2);
      expect(listings.every((l) => l.sellerId === sellerId)).toBe(true);
    });
  });

  describe("update", () => {
    it("should throw error for non-existent listing", async () => {
      await expect(
        repository.update(
          "non-existent",
          createValidProductListing({
            product: createValidProduct({ price: 600 }),
          })
        )
      ).rejects.toThrow("Listing not found");
    });

    it("should update product data", async () => {
      const created = await repository.create(mockListing);
      console.log(created);
      const updated = await repository.update(
        created.id!,
        createValidProductListing({
          product: createValidProduct({ price: 600 }),
        })
      );

      expect(updated.product.price).toBe(600);
      expect(updated.updatedAt).not.toBe(created.updatedAt);
      expect(updated.product.title).toBe(mockListing.product.title);
    });
  });

  describe("delete", () => {
    it("should throw error for non-existent listing", async () => {
      await expect(repository.delete("non-existent")).rejects.toThrow(
        "Listing not found"
      );
    });

    it("should delete listing", async () => {
      const created = await repository.create(mockListing);
      await repository.delete(created.id!);

      const found = await repository.findById(created.id!);
      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    const createListing = (product: Partial<ProductEntity>) =>
      createValidProductListing({ product: createValidProduct(product) });

    const mockListings = [
      createListing({
        title: "macbook air",
        category: ProductCategory.ELECTRONICS,
        price: 400,
      }),
      createListing({
        title: "macbook pro",
        category: ProductCategory.CLOTHING,
        price: 1000,
      }),
    ];

    beforeEach(async () => {
      repository = new InMemoryProductListingRepository();
      await repository.reset();
      for (const listing of mockListings) {
        await repository.create(listing);
      }
    });

    it("should return all listings without filters", async () => {
      const listings = await repository.findAll({
        offset: 0,
        limit: 10,
      });
      expect(listings.data).toHaveLength(2);
      expect(listings.total).toBe(2);
    });

    it("should filter by category", async () => {
      const result = await repository.findAll(
        { offset: 0, limit: 10 },
        { category: ProductCategory.ELECTRONICS }
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].product.category).toBe(ProductCategory.ELECTRONICS);
    });

    it("should filter by min price", async () => {
      const result = await repository.findAll(
        { offset: 0, limit: 10 },
        { minPrice: 750 }
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].product.price).toBe(1000);
    });

    it("should return empty array when no listings match filters", async () => {
      const result = await repository.findAll(
        { offset: 0, limit: 10 },
        { category: ProductCategory.BOOKS }
      );
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should combine multiple filters", async () => {
      const result = await repository.findAll(
        { offset: 0, limit: 10 },
        { category: ProductCategory.ELECTRONICS, maxPrice: 800 }
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].product.category).toBe(ProductCategory.ELECTRONICS);
      expect(result.data[0].product.price).toBe(400);
    });
  });
});
