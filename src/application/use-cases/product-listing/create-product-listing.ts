import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductListingValidator } from "@domain/validators/product-listing-validator";

export class CreateProductListingUseCase {
  constructor(
    private readonly productListingRepository: ProductListingRepository
  ) {}

  async execute(
    sellerId: string,
    listing: ProductListingEntity
  ): Promise<ProductListingEntity> {
    const listingFormatted: ProductListingEntity = {
      ...listing,
      sellerId: sellerId,
    };
    ProductListingValidator.validate(listingFormatted);
    return this.productListingRepository.create(listingFormatted);
  }
}
