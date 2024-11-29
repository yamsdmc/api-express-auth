import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ListingNotFoundError } from "@domain/errors";
import { UserListingDTO } from "@domain/DTO/UserListingDTO";
import { UserRepository } from "@domain/repositories/user-repository";
import { UserListing } from "@domain/models/UserListing";
import { UserVO } from "@domain/entities/User";

export class GetListingByIdUseCase {
  constructor(
    private readonly productListingRepository: ProductListingRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(id: string): Promise<UserListingDTO> {
    const listing = await this.productListingRepository.findById(id);
    if (!listing) {
      throw new ListingNotFoundError();
    }

    const countListingsForUser =
      await this.productListingRepository.countListingsForUser(
        listing.sellerId
      );
    const seller = await this.userRepository.findById(listing.sellerId);

    return new UserListing(
      listing,
      countListingsForUser,
      new UserVO(seller!).fullName
    ).toDTO();
  }
}
