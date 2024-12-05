/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Create verification_code_type enum
  pgm.createType("verification_code_type", [
    "EMAIL_VERIFICATION",
    "PASSWORD_RESET",
  ]);

  // Create users table
  pgm.createTable("users", {
    id: { type: "uuid", primaryKey: true },
    email: { type: "varchar(255)", notNull: true, unique: true },
    password: { type: "varchar(255)", notNull: true },
    firstname: { type: "varchar(100)", notNull: true },
    lastname: { type: "varchar(100)", notNull: true },
    is_verified: { type: "boolean", notNull: true, default: false },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create refresh_tokens table
  pgm.createTable("refresh_tokens", {
    token: { type: "uuid", primaryKey: true },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    expires_at: { type: "timestamp with time zone", notNull: true },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create verification_codes table
  pgm.createTable("verification_codes", {
    id: { type: "uuid", primaryKey: true },
    code: { type: "varchar(6)", notNull: true },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    type: { type: "verification_code_type", notNull: true },
    expires_at: { type: "timestamp with time zone", notNull: true },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    used_at: { type: "timestamp with time zone" },
  });

  // Code length constraint
  pgm.addConstraint("verification_codes", "valid_code", {
    check: "LENGTH(code) = 6",
  });

  // Create product_listings table
  pgm.createTable("product_listings", {
    id: { type: "uuid", primaryKey: true },
    seller_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    title: { type: "varchar(255)", notNull: true },
    description: { type: "text" },
    price: { type: "decimal(10,2)", notNull: true },
    category: { type: "varchar(50)", notNull: true },
    condition: { type: "varchar(50)", notNull: true },
    location: { type: "varchar(255)", notNull: true },
    phone_number: { type: "varchar(20)", notNull: true },
    images: { type: "text[]" },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create blacklisted_tokens table
  pgm.createTable("blacklisted_tokens", {
    token: { type: "text", primaryKey: true },
    expiry_date: { type: "timestamp with time zone", notNull: true },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create indexes
  pgm.createIndex("blacklisted_tokens", "expiry_date");
  pgm.createIndex("users", "email");
  pgm.createIndex("refresh_tokens", "user_id");
  pgm.createIndex("verification_codes", "code");
  pgm.createIndex("verification_codes", ["user_id", "type"]);
  pgm.createIndex("product_listings", "seller_id");
  pgm.createIndex("product_listings", "category");
  pgm.createIndex("product_listings", "price");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("product_listings", "price");
  pgm.dropIndex("product_listings", "category");
  pgm.dropIndex("product_listings", "seller_id");
  pgm.dropIndex("verification_codes", ["user_id", "type"]);
  pgm.dropIndex("verification_codes", "code");
  pgm.dropIndex("refresh_tokens", "user_id");
  pgm.dropIndex("users", "email");
  pgm.dropIndex("blacklisted_tokens", "expiry_date");

  pgm.dropTable("blacklisted_tokens");
  pgm.dropTable("product_listings");
  pgm.dropTable("verification_codes");
  pgm.dropTable("refresh_tokens");
  pgm.dropTable("users");

  pgm.dropType("verification_code_type");
};
