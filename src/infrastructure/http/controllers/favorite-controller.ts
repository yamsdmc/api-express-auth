import { Request, Response } from 'express';
import { AddToFavoritesUseCase } from '../../../application/use-cases/favorite/add-to-favorites';
import { RemoveFromFavoritesUseCase } from '../../../application/use-cases/favorite/remove-from-favorites';
import { GetUserFavoritesUseCase } from '../../../application/use-cases/favorite/get-user-favorites';
import { CheckFavoriteStatusUseCase } from '../../../application/use-cases/favorite/check-favorite-status';
import { RepositoryFactory } from '../../factories/repository-factory';
import * as console from "node:console";

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
    const startTime = Date.now();
    console.log('🚀 [CONTROLLER] addToFavorites called');
    console.log('👤 [CONTROLLER] Request userId:', req.userId);
    console.log('📋 [CONTROLLER] Request body:', req.body);
    console.log('🔍 [CONTROLLER] Request headers:', {
      authorization: req.headers.authorization ? '***PRESENT***' : '***MISSING***',
      contentType: req.headers['content-type']
    });

    try {
      const userId = req.userId;
      const { listingId } = req.body;

      console.log('🔍 [CONTROLLER] Extracted data:', { userId, listingId });

      if (!userId) {
        console.log('❌ [CONTROLLER] No userId found in request');
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      if (!listingId) {
        console.log('❌ [CONTROLLER] No listingId found in request body');
        res.status(400).json({ message: 'Listing ID is required' });
        return;
      }

      console.log('📞 [CONTROLLER] Calling addToFavorites use case');
      const favorite = await this.addToFavoritesUseCase.execute({
        userId,
        listingId,
      });

      const endTime = Date.now();
      console.log('✅ [CONTROLLER] Favorite added successfully');
      console.log('📊 [CONTROLLER] Added favorite:', favorite);
      console.log('⏱️ [CONTROLLER] Total request duration:', endTime - startTime, 'ms');

      res.status(201).json({
        message: 'Added to favorites successfully',
        data: favorite,
      });
    } catch (error: any) {
      const endTime = Date.now();
      console.error('❌ [CONTROLLER] addToFavorites error:', error);
      console.error('📋 [CONTROLLER] Error details:', {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        errorStatus: error.status,
        userId: req.userId,
        requestBody: req.body,
        duration: endTime - startTime + 'ms'
      });
      this.handleError(res, error);
    }
  };

  /**
   * DELETE /api/favorites/:listingId
   * Remove a listing from user's favorites
   */
  removeFromFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
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
    const startTime = Date.now();
    console.log('🚀 [CONTROLLER] getUserFavorites called');
    console.log('👤 [CONTROLLER] Request userId:', req.userId);
    console.log('🔍 [CONTROLLER] Request headers:', {
      authorization: req.headers.authorization ? '***PRESENT***' : '***MISSING***',
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']
    });

    try {
      const userId = req.userId;

      if (!userId) {
        console.log('❌ [CONTROLLER] No userId found in request');
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      console.log('📞 [CONTROLLER] Calling use case with userId:', userId);
      const favorites = await this.getUserFavoritesUseCase.execute(userId);
      console.log('favorites:', favorites);
      
      const endTime = Date.now();
      console.log('✅ [CONTROLLER] Use case completed successfully');
      console.log('📊 [CONTROLLER] Retrieved favorites count:', favorites.length);
      console.log('⏱️ [CONTROLLER] Total request duration:', endTime - startTime, 'ms');

      res.status(200).json({
        message: 'Favorites retrieved successfully',
        data: favorites,
        count: favorites.length,
      });
      
    } catch (error: any) {
      const endTime = Date.now();
      console.error('❌ [CONTROLLER] getUserFavorites error:', error);
      console.error('📋 [CONTROLLER] Error details:', {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        errorStatus: error.status,
        userId: req.userId,
        duration: endTime - startTime + 'ms'
      });
      this.handleError(res, error);
    }
  };

  /**
   * GET /api/favorites/check/:listingId
   * Check if a listing is in user's favorites
   */
  checkFavoriteStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const { listingId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const isFavorite = await this.checkFavoriteStatusUseCase.execute(userId, listingId);
      console.log('isFavorite: -> checkFavoriteStatus', isFavorite);
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

    // Handle domain errors with specific codes
    if (error.code && error.status) {
      res.status(error.status).json({
        message: error.message,
        code: error.code,
        type: 'DOMAIN_ERROR'
      });
      return;
    }

    // Handle specific business logic errors (fallback)
    if (error.message.includes('already in your favorites')) {
      res.status(409).json({ 
        message: error.message,
        code: 'FAVORITE_ALREADY_EXISTS',
        type: 'BUSINESS_ERROR'
      });
      return;
    }

    if (error.message.includes('not in your favorites')) {
      res.status(404).json({ 
        message: error.message,
        code: 'FAVORITE_NOT_FOUND',
        type: 'BUSINESS_ERROR'
      });
      return;
    }

    if (error.message.includes('not found')) {
      res.status(404).json({ 
        message: error.message,
        code: 'RESOURCE_NOT_FOUND',
        type: 'BUSINESS_ERROR'
      });
      return;
    }

    if (error.message.includes('cannot add your own listing')) {
      res.status(403).json({ 
        message: error.message,
        code: 'FAVORITE_OWN_LISTING',
        type: 'BUSINESS_ERROR'
      });
      return;
    }

    if (error.message.includes('required')) {
      res.status(400).json({ 
        message: error.message,
        code: 'VALIDATION_ERROR',
        type: 'VALIDATION_ERROR'
      });
      return;
    }

    // Generic server error
    res.status(500).json({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      type: 'SYSTEM_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
