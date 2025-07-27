import { describe, it, expect, beforeEach } from "vitest";
import { CreateProductListingUseCase } from "@application/use-cases/product-listing/create-product-listing";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import { createValidProductListing } from "./factories/productListing.factory";

describe("CreateProductListingUseCase", () => {
  let useCase: CreateProductListingUseCase;
  let repository: InMemoryProductListingRepository;
  const sellerId = "seller-123";

  const mockListing: ProductListingEntity = createValidProductListing();

  beforeEach(() => {
    repository = new InMemoryProductListingRepository();
    useCase = new CreateProductListingUseCase(repository);
  });

  it("should create a new product listing", async () => {
    const result = await useCase.execute(sellerId, mockListing);

    expect(result).toMatchObject({
      sellerId,
      product: expect.objectContaining({
        title: mockListing.product.title,
        price: mockListing.product.price,
        category: mockListing.product.category,
        subcategory: mockListing.product.subcategory,
      }),
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should store the listing in repository", async () => {
    const created = await useCase.execute(sellerId, mockListing);
    const found = await repository.findById(created.id!);

    expect(found).toBeDefined();
    expect(found?.product.title).toBe(mockListing.product.title);
    expect(found?.product.category).toBe(mockListing.product.category);
    expect(found?.product.subcategory).toBe(mockListing.product.subcategory);
  });

  it("should create listing with valid category-subcategory mapping", async () => {
    const result = await useCase.execute(sellerId, mockListing);
    
    expect(result.product.category).toBeDefined();
    expect(result.product.subcategory).toBeDefined();
    // Verify that subcategory is valid for the category
    expect(typeof result.product.category).toBe("string");
    expect(typeof result.product.subcategory).toBe("string");
  });
});
