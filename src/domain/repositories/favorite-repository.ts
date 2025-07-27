import { Favorite, CreateFavoriteData, FavoritesFilter } from '../entities/Favorite';
import { ProductListingEntity } from '../entities/ProductListing';

/**
 * Favorite Repository Interface
 * 
 * Defines the contract for favorite data persistence.
 * Follows the Repository pattern from Domain-Driven Design.
 */
export interface FavoriteRepository {
  /**
   * Add a listing to user's favorites
   */
  addToFavorites(data: CreateFavoriteData): Promise<Favorite>;

  /**
   * Remove a listing from user's favorites
   */
  removeFromFavorites(userId: string, listingId: string): Promise<void>;

  /**
   * Get user's favorite listings with full listing details
   */
  getUserFavorites(userId: string): Promise<ProductListingEntity[]>;

  /**
   * Check if a specific listing is in user's favorites
   */
  isFavorite(userId: string, listingId: string): Promise<boolean>;

  /**
   * Get raw favorites data (without listing details)
   */
  getFavorites(filter: FavoritesFilter): Promise<Favorite[]>;

  /**
   * Remove all favorites for a specific listing (when listing is deleted)
   */
  removeAllFavoritesForListing(listingId: string): Promise<void>;

  /**
   * Get favorites count for a user
   */
  getFavoritesCount(userId: string): Promise<number>;
}