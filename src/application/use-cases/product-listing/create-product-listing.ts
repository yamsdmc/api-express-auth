import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductEntity } from "@domain/entities/Product";
import { ProductListingValidator } from "@domain/validators/product-listing-validator";

export class CreateProductListingUseCase {
  constructor(
    private readonly productListingRepository: ProductListingRepository
  ) {}

  async execute(
    sellerId: string,
    product: ProductEntity
  ): Promise<ProductListingEntity> {
    ProductListingValidator.validate(product);
    return this.productListingRepository.create(sellerId, product);
  }
}
