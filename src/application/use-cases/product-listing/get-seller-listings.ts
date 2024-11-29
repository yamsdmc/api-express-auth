import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductListingRepository } from "@domain/repositories/product-listing-repository";

export class GetSellerListingsUseCase {
  constructor(
    private readonly productListingRepository: ProductListingRepository
  ) {}

  async execute(sellerId: string): Promise<ProductListingEntity[]> {
    return this.productListingRepository.findBySellerId(sellerId);
  }
  async countSellerListings(sellerId: string): Promise<number> {
    return this.productListingRepository.countListingsForUser(sellerId);
  }
}
