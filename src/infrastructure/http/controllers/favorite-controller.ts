import { Request, Response } from 'express';
import { AddToFavoritesUseCase } from '../../../application/use-cases/favorite/add-to-favorites';
import { RemoveFromFavoritesUseCase } from '../../../application/use-cases/favorite/remove-from-favorites';
import { GetUserFavoritesUseCase } from '../../../application/use-cases/favorite/get-user-favorites';
import { CheckFavoriteStatusUseCase } from '../../../application/use-cases/favorite/check-favorite-status';
import { RepositoryFactory } from '../../factories/repository-factory';

/**
 * Favorite Controller
 * 
 * Handles HTTP requests for favorite operations.
 * Follows REST API conventions and proper error handling.
 */
export class FavoriteController {
  private addToFavoritesUseCase: AddToFavoritesUseCase;
  private removeFromFavoritesUseCase: RemoveFromFavoritesUseCase;
  private getUserFavoritesUseCase: GetUserFavoritesUseCase;
  private checkFavoriteStatusUseCase: CheckFavoriteStatusUseCase;

  constructor() {
    const factory = new RepositoryFactory('postgresql');
    const favoriteRepository = factory.createFavoriteRepository();
    const productListingRepository = factory.createProductListingRepository();
    const userRepository = factory.createUserRepository();

    this.addToFavoritesUseCase = new AddToFavoritesUseCase(
      favoriteRepository,
      productListingRepository,
      userRepository
    );
    
    this.removeFromFavoritesUseCase = new RemoveFromFavoritesUseCase(
      favoriteRepository,
      userRepository
    );
    
    this.getUserFavoritesUseCase = new GetUserFavoritesUseCase(
      favoriteRepository,
      userRepository
    );
    
    this.checkFavoriteStatusUseCase = new CheckFavoriteStatusUseCase(
      favoriteRepository
    );
  }

  /**
   * POST /api/favorites
   * Add a listing to user's favorites
   */
  addToFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { listingId } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      if (!listingId) {
        res.status(400).json({ message: 'Listing ID is required' });
        return;
      }

      const favorite = await this.addToFavoritesUseCase.execute({
        userId,
        listingId,
      });

      res.status(201).json({
        message: 'Added to favorites successfully',
        data: favorite,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * DELETE /api/favorites/:listingId
   * Remove a listing from user's favorites
   */
  removeFromFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { listingId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      await this.removeFromFavoritesUseCase.execute(userId, listingId);

      res.status(200).json({
        message: 'Removed from favorites successfully',
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * GET /api/favorites
   * Get user's favorite listings
   */
  getUserFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const favorites = await this.getUserFavoritesUseCase.execute(userId);

      res.status(200).json({
        message: 'Favorites retrieved successfully',
        data: favorites,
        count: favorites.length,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  /**
   * GET /api/favorites/check/:listingId
   * Check if a listing is in user's favorites
   */
  checkFavoriteStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { listingId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const isFavorite = await this.checkFavoriteStatusUseCase.execute(userId, listingId);

      res.status(200).json({
        message: 'Favorite status retrieved successfully',
        data: { isFavorite },
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: any): void {
    console.error('Favorite Controller Error:', error);

    // Handle specific business logic errors
    if (error.message.includes('already in your favorites')) {
      res.status(409).json({ message: error.message });
      return;
    }

    if (error.message.includes('not in your favorites')) {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error.message.includes('not found')) {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error.message.includes('cannot add your own listing')) {
      res.status(403).json({ message: error.message });
      return;
    }

    if (error.message.includes('required')) {
      res.status(400).json({ message: error.message });
      return;
    }

    // Generic server error
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}