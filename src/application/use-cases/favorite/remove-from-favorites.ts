import { FavoriteRepository } from '../../../domain/repositories/favorite-repository';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { InvalidUserIdError, UserNotFoundError, FavoriteNotFoundError } from '../../../domain/errors';

/**
 * Remove from Favorites Use Case
 * 
 * Business logic for removing a listing from user's favorites.
 */
export class RemoveFromFavoritesUseCase {
  constructor(
    private favoriteRepository: FavoriteRepository,
    private userRepository: UserRepository
  ) {}

  async execute(userId: string, listingId: string): Promise<void> {
    // Domain validation: Input must be valid
    if (!userId || !listingId) {
      throw new InvalidUserIdError();
    }

    // Domain rule: User must exist
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Domain rule: Can only remove existing favorites
    const isFavorite = await this.favoriteRepository.isFavorite(userId, listingId);
    if (!isFavorite) {
      throw new FavoriteNotFoundError();
    }

    // Remove from favorites
    await this.favoriteRepository.removeFromFavorites(userId, listingId);
  }
}