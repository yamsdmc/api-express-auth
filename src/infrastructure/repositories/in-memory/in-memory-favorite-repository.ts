import { FavoriteRepository } from '../../../domain/repositories/favorite-repository';
import { Favorite, CreateFavoriteData, FavoritesFilter, FavoriteFactory } from '../../../domain/entities/Favorite';
import { ProductListingEntity } from '../../../domain/entities/ProductListing';

/**
 * In-Memory implementation of the Favorite Repository
 * 
 * Used for testing purposes. Stores favorites in memory.
 */
export class InMemoryFavoriteRepository implements FavoriteRepository {
  private favorites: Favorite[] = [];

  async addToFavorites(data: CreateFavoriteData): Promise<Favorite> {
    // Check if already exists
    const exists = this.favorites.some(
      f => f.userId === data.userId && f.listingId === data.listingId
    );

    if (exists) {
      throw new Error('This listing is already in your favorites');
    }

    const favorite = FavoriteFactory.create(data);
    this.favorites.push(favorite);
    return favorite;
  }

  async removeFromFavorites(userId: string, listingId: string): Promise<void> {
    const initialLength = this.favorites.length;
    this.favorites = this.favorites.filter(
      f => !(f.userId === userId && f.listingId === listingId)
    );

    if (this.favorites.length === initialLength) {
      throw new Error('This listing is not in your favorites');
    }
  }

  async getUserFavorites(userId: string): Promise<ProductListingEntity[]> {
    // For in-memory implementation, return empty array
    // In real implementation, we would join with listings data
    return [];
  }

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    return this.favorites.some(
      f => f.userId === userId && f.listingId === listingId
    );
  }

  async getFavorites(filter: FavoritesFilter): Promise<Favorite[]> {
    let result = this.favorites.filter(f => f.userId === filter.userId);

    if (filter.listingId) {
      result = result.filter(f => f.listingId === filter.listingId);
    }

    // Apply pagination
    if (filter.offset) {
      result = result.slice(filter.offset);
    }

    if (filter.limit) {
      result = result.slice(0, filter.limit);
    }

    return result;
  }

  async removeAllFavoritesForListing(listingId: string): Promise<void> {
    this.favorites = this.favorites.filter(f => f.listingId !== listingId);
  }

  async getFavoritesCount(userId: string): Promise<number> {
    return this.favorites.filter(f => f.userId === userId).length;
  }

  // Test helper methods
  clear(): void {
    this.favorites = [];
  }

  getAll(): Favorite[] {
    return [...this.favorites];
  }
}