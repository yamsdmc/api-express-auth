import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ListingNotFoundError } from "@domain/errors";
import { ProductListingEntity } from "@domain/entities/ProductListing";

export class GetListingByIdUseCase {
  constructor(
    private readonly productListingRepository: ProductListingRepository
  ) {}

  async execute(id: string): Promise<ProductListingEntity> {
    const listing = await this.productListingRepository.findById(id);
    if (!listing) {
      throw new ListingNotFoundError();
    }
    return listing;
  }
}
