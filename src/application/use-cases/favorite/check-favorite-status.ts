import { FavoriteRepository } from '../../../domain/repositories/favorite-repository';

/**
 * Check Favorite Status Use Case
 * 
 * Checks if a specific listing is in user's favorites.
 * Simple use case with minimal business logic.
 */
export class CheckFavoriteStatusUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(userId: string, listingId: string): Promise<boolean> {
    // Validate inputs
    if (!userId || !listingId) {
      return false;
    }

    // Check favorite status
    return await this.favoriteRepository.isFavorite(userId, listingId);
  }
}