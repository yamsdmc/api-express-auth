import { UserListingDTO } from "@domain/DTO/UserListingDTO";
import { ProductListingEntity } from "@domain/entities/ProductListing";

export class UserListing {
  constructor(
    private readonly listing: ProductListingEntity,
    private readonly numberOfActiveLists: number,
    private readonly fullName: string
  ) {}

  toDTO(): UserListingDTO {
    return {
      ...this.listing,
      user: {
        fullName: this.fullName,
        numberOfActiveLists: this.numberOfActiveLists,
      },
    };
  }
}
