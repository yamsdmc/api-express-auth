/**
 * Favorite Entity
 * 
 * Represents a user's favorite listing in the domain.
 * Follows Domain-Driven Design principles.
 */
export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

/**
 * Data required to create a new favorite
 */
export interface CreateFavoriteData {
  userId: string;
  listingId: string;
}

/**
 * Filter criteria for retrieving favorites
 */
export interface FavoritesFilter {
  userId: string;
  listingId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Favorite Factory - Creates valid favorite entities
 */
export class FavoriteFactory {
  static create(data: CreateFavoriteData): Favorite {
    // Business rules validation
    if (!data.userId || !data.listingId) {
      throw new Error('UserId and ListingId are required to create a favorite');
    }

    if (data.userId.trim().length === 0 || data.listingId.trim().length === 0) {
      throw new Error('UserId and ListingId cannot be empty');
    }

    return {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId.trim(),
      listingId: data.listingId.trim(),
      createdAt: new Date(),
    };
  }

  /**
   * Create from database data (with existing ID)
   */
  static fromDatabase(data: {
    id: string;
    userId: string;
    listingId: string;
    createdAt: Date;
  }): Favorite {
    return {
      id: data.id,
      userId: data.userId,
      listingId: data.listingId,
      createdAt: data.createdAt,
    };
  }
}