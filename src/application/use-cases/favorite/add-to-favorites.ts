import { FavoriteRepository } from '../../../domain/repositories/favorite-repository';
import { ProductListingRepository } from '../../../domain/repositories/product-listing-repository';
import { UserRepository } from '../../../domain/repositories/user-repository';
import { CreateFavoriteData, Favorite, FavoriteFactory } from '../../../domain/entities/Favorite';

/**
 * Add to Favorites Use Case
 * 
 * Business logic for adding a listing to user's favorites.
 * Implements domain rules and validation.
 */
export class AddToFavoritesUseCase {
  constructor(
    private favoriteRepository: FavoriteRepository,
    private productListingRepository: ProductListingRepository,
    private userRepository: UserRepository
  ) {}

  async execute(data: CreateFavoriteData): Promise<Favorite> {
    // Validate business invariants
    await this.validateBusinessRules(data);

    // Check if already in favorites
    const isAlreadyFavorite = await this.favoriteRepository.isFavorite(
      data.userId,
      data.listingId
    );

    if (isAlreadyFavorite) {
      throw new Error('This listing is already in your favorites');
    }

    // Create and persist the favorite
    return await this.favoriteRepository.addToFavorites(data);
  }

  private async validateBusinessRules(data: CreateFavoriteData): Promise<void> {
    // Use the factory to validate data
    FavoriteFactory.create(data);

    // Business rule: User must exist
    const user = await this.userRepository.getById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Business rule: Listing must exist and be active
    const listing = await this.productListingRepository.getById(data.listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    // Business rule: User cannot favorite their own listing
    if (listing.userId === data.userId) {
      throw new Error('You cannot add your own listing to favorites');
    }

    // Here we could add other business rules:
    // - Maximum number of favorites per user
    // - Only active listings can be favorited
    // - Premium users have unlimited favorites, etc.
  }
}