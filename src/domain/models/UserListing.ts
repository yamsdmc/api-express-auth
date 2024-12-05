import { UserListingDTO } from "@domain/DTO/UserListingDTO";
import { ProductListingEntity } from "@domain/entities/ProductListing";

export class UserListing {
  constructor(
    private readonly listing: ProductListingEntity,
    private readonly numberOfActiveLists: number,
    private readonly fullName: string,
    private readonly createdAt: Date
  ) {}

  toDTO(): UserListingDTO {
    return {
      ...this.listing,
      user: {
        fullName: this.fullName,
        numberOfActiveLists: this.numberOfActiveLists,
        createdAt: this.formatMonthYear(this.createdAt),
      },
    };
  }

  private formatMonthYear(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }
}
