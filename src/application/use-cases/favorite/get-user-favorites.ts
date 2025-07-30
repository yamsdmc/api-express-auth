import {FavoriteRepository} from '@domain/repositories/favorite-repository';
import {UserRepository} from '@domain/repositories/user-repository';
import {ProductListingEntity} from '@domain/entities/ProductListing';
import {InvalidUserIdError, UserNotFoundError} from '@domain/errors';
import * as console from "node:console";

/**
 * Get User Favorites Use Case
 * 
 * Retrieves user's favorite listings with full details.
 * Includes business logic for filtering and pagination.
 */
export class GetUserFavoritesUseCase {
  constructor(
    private favoriteRepository: FavoriteRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<ProductListingEntity[]> {
    // Domain validation: Input must be valid
    if (!userId) {
      throw new InvalidUserIdError();
    }

    // Domain rule: User must exist to have favorites
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    console.log('user', user)

   return await this.favoriteRepository.getUserFavorites(userId);
  }
}
