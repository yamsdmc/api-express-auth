export class ApplicationError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
  }
}

export class UserAlreadyExistsError extends ApplicationError {
  constructor() {
    super("Email already exists", "AUTH_001", 409);
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super("Invalid credentials", "AUTH_002", 401);
  }
}

export class TokenExpiredError extends ApplicationError {
  constructor() {
    super("Token expired", "AUTH_003", 401);
  }
}

export class InvalidTokenError extends ApplicationError {
  constructor() {
    super("Invalid token", "AUTH_004", 401);
  }
}

export class EmailNotVerifiedError extends ApplicationError {
  constructor() {
    super("Email not verified", "AUTH_005", 403);
  }
}

export class EmailAlreadyVerifiedError extends ApplicationError {
  constructor() {
    super("Email already verified", "AUTH_006", 400);
  }
}

export class ListingError extends ApplicationError {
  constructor(message: string, code: string, status = 400) {
    super(message, code, status);
  }
}

export class ListingNotFoundError extends ListingError {
  constructor() {
    super("Listing not found", "LISTING_001", 404);
  }
}

export class UnauthorizedListingAccessError extends ListingError {
  constructor() {
    super(
      "Unauthorized: listing does not belong to seller",
      "LISTING_002",
      403
    );
  }
}

export class InvalidListingDataError extends ListingError {
  constructor(message: string) {
    super(message, "LISTING_003", 400);
  }
}

export class InvalidPriceError extends ListingError {
  constructor(message: string) {
    super(message, "LISTING_PRICE_001", 400);
  }
}

export class InvalidImagesError extends ListingError {
  constructor(message: string) {
    super(message, "LISTING_IMAGES_001", 400);
  }
}

export class InvalidTitleError extends ListingError {
  constructor(message: string) {
    super(message, "LISTING_TITLE_001", 400);
  }
}
export class InvalidDescriptionError extends ListingError {
  constructor(message: string) {
    super(message, "LISTING_DESCRIPTION_001", 400);
  }
}

export class InvalidCategoryError extends ListingError {
  constructor(message: string) {
    super(message, "LISTING_CATEGORY_001", 400);
  }
}

export class InvalidPhoneNumberError extends ListingError {
  constructor(message: string) {
    super(message, "LISTING_PHONE_NUMBER_001", 400);
  }
}

export class UserError extends ApplicationError {
  constructor(message: string, code: string, status = 400) {
    super(message, code, status);
  }
}

export class EmptyUpdateError extends UserError {
  constructor() {
    super("At least one field must be provided for update", "USER_004", 400);
  }
}
export class UserNotFoundError extends UserError {
  constructor() {
    super("User not found", "USER_001", 404);
  }
}
