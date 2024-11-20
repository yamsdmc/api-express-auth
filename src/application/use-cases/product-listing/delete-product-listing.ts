import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import {
  ListingNotFoundError,
  UnauthorizedListingAccessError,
} from "@domain/errors";

export class DeleteProductListingUseCase {
  constructor(
    private readonly productListingRepository: ProductListingRepository
  ) {}

  async execute(listingId: string, sellerId: string): Promise<void> {
    const listing = await this.productListingRepository.findById(listingId);
    if (!listing) {
      throw new ListingNotFoundError();
    }

    if (listing.sellerId !== sellerId) {
      throw new UnauthorizedListingAccessError();
    }

    await this.productListingRepository.delete(listingId);
  }
}
