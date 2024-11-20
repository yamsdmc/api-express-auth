import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ProductEntity } from "@domain/entities/Product";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import {
  ListingNotFoundError,
  UnauthorizedListingAccessError,
} from "@domain/errors";

export class UpdateProductListingUseCase {
  constructor(
    private readonly productListingRepository: ProductListingRepository
  ) {}

  async execute(
    listingId: string,
    sellerId: string,
    productData: Partial<ProductEntity>
  ): Promise<ProductListingEntity> {
    const listing = await this.productListingRepository.findById(listingId);
    if (!listing) {
      throw new ListingNotFoundError();
    }

    if (listing.sellerId !== sellerId) {
      throw new UnauthorizedListingAccessError();
    }

    return this.productListingRepository.update(listingId, productData);
  }
}
