import { FavoriteRepository } from '../../../domain/repositories/favorite-repository';
import { UserRepository } from '../../../domain/repositories/user-repository';

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
    // Validate inputs
    if (!userId || !listingId) {
      throw new Error('UserId and ListingId are required');
    }

    // Business rule: User must exist
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if listing is in favorites
    const isFavorite = await this.favoriteRepository.isFavorite(userId, listingId);
    if (!isFavorite) {
      throw new Error('This listing is not in your favorites');
    }

    // Remove from favorites
    await this.favoriteRepository.removeFromFavorites(userId, listingId);
  }
}