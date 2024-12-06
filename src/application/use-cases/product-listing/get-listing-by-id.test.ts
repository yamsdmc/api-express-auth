import { describe, it, expect, beforeEach } from "vitest";
import { GetListingByIdUseCase } from "@application/use-cases/product-listing/get-listing-by-id";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ListingNotFoundError } from "@domain/errors";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import { createValidProductListing } from "./factories/productListing.factory";
import { UserRepository } from "@domain/repositories/user-repository";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";

describe("GetListingByIdUseCase", () => {
  let useCase: GetListingByIdUseCase;
  let repository: InMemoryProductListingRepository;
  let userRepository: UserRepository;
  let existingListingId: string;

  const mockListing: ProductListingEntity = createValidProductListing();

  beforeEach(async () => {
    repository = new InMemoryProductListingRepository();
    userRepository = new InMemoryUserRepository();
    useCase = new GetListingByIdUseCase(repository, userRepository);

    const listing = await repository.create(mockListing);
    existingListingId = listing.id!;
  });

  it("should return listing for valid id", async () => {
    userRepository.create({
      id: mockListing.sellerId,
      email: "test@example.com",
      password: "hashedPassword",
      isVerified: true,
      updatedAt: new Date(),
      createdAt: new Date(),
      firstname: "Test",
      lastname: "User",
    });
    const listing = await useCase.execute(existingListingId);

    expect(listing).toBeDefined();
    expect(listing.id).toBe(existingListingId);
    expect(listing.product.title).toBe(mockListing.product.title);
  });

  it("should return listing for valid id with some users informations", async () => {
    userRepository.create({
      id: mockListing.sellerId,
      email: "test@example.com",
      password: "hashedPassword",
      isVerified: true,
      createdAt: new Date(),
      firstname: "Test",
      updatedAt: new Date(),
      lastname: "User",
    });
    const listing = await useCase.execute(existingListingId);

    expect(listing).toBeDefined();
    expect(listing.id).toBe(existingListingId);
    expect(listing.user).toEqual({
      fullName: "Test User",
      numberOfActiveLists: 1,
      createdAt: "December 2024",
    });
  });
  it("should throw ListingNotFoundError for non-existent id", async () => {
    await expect(useCase.execute("non-existent-id")).rejects.toThrow(
      ListingNotFoundError
    );
  });
});
