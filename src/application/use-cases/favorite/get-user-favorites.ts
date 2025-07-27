import { FavoriteRepository } from '../../../domain/repositories/favorite-repository';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { ProductListing } from '../../../domain/entities/ProductListing';

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

  async execute(userId: string): Promise<ProductListing[]> {
    // Validate inputs
    if (!userId) {
      throw new Error('UserId is required');
    }

    // Business rule: User must exist
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get favorites with listing details
    const favorites = await this.favoriteRepository.getUserFavorites(userId);

    // Apply business logic: filter only active listings
    return favorites.filter(listing => listing.isActive !== false);
  }
}