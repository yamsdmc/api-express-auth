# 🔧 Claude.MD - API Backend XpatMart

> **Documentation technique spécialisée** pour le backend Node.js/Express/PostgreSQL

## 📋 Vue d'ensemble

API REST pour marketplace expatriés avec architecture **Clean/Hexagonale**, authentification JWT, et base PostgreSQL.

**📁 Référence centrale** : [`/claude.md`](../claude.md) - Documentation globale du projet

---

## 🏗️ Architecture Clean/Hexagonale

```
src/
├── domain/               # 🎯 CŒUR MÉTIER (Business Logic)
│   ├── entities/         # Entités principales (User, Listing)
│   ├── value-objects/    # Objects valeur (Email, Price)
│   ├── repositories/     # Interfaces repositories
│   ├── services/         # Services métier
│   ├── validators/       # Validation domaine
│   ├── DTO/             # Data Transfer Objects
│   ├── enums/           # Énumérations métier
│   ├── errors.ts        # Erreurs métier
│   └── auth.ts          # Logique auth pure
├── application/          # 🔄 COUCHE APPLICATION
│   ├── use-cases/       # Cas d'usage (CreateListing, AuthUser)
│   ├── services/        # Services applicatifs
│   └── validators/      # Validation application
├── infrastructure/       # 🔌 COUCHE INFRASTRUCTURE
│   ├── database/        # PostgreSQL config & migrations
│   ├── repositories/    # Implémentations repositories
│   ├── http/           # Routes & controllers Express
│   ├── services/       # Services externes (email, storage)
│   └── factories/      # Dependency injection
├── shared/              # 🛠️ UTILITAIRES
│   └── utils/          # Helpers, validation env, etc.
└── __tests__/           # 🧪 TESTS E2E
    ├── auth.e2e.test.ts
    └── listings.e2e.test.ts
```

---

## 🌐 Endpoints API

### 🔐 Authentication (`/auth`)

#### POST `/auth/register`
**Description** : Inscription nouvel utilisateur
```typescript
// Request
{
  email: string;           // email@example.com
  password: string;        // min 8 chars
  firstName: string;
  lastName: string;
  country?: string;
}

// Response 201
{
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  };
  token: string;           // JWT token
}

// Errors
400: ValidationError     // Email invalide, mot de passe faible
409: ConflictError      // Email déjà existant
```

#### POST `/auth/login`
**Description** : Connexion utilisateur
```typescript
// Request
{
  email: string;
  password: string;
}

// Response 200
{
  user: UserProfile;
  token: string;
}

// Errors
401: AuthenticationError // Credentials invalides
404: NotFoundError      // Utilisateur inexistant
```

#### POST `/auth/logout`
**Description** : Déconnexion (blacklist token)
```typescript
// Headers
Authorization: Bearer <token>

// Response 200
{ message: "Logged out successfully" }
```

#### POST `/auth/refresh`
**Description** : Renouvellement token JWT
```typescript
// Headers
Authorization: Bearer <token>

// Response 200
{ token: string }

// Errors
401: TokenExpiredError
403: InvalidTokenError
```

---

### 👤 Users (`/users`)

#### GET `/users/profile`
**Description** : Profil utilisateur connecté
```typescript
// Headers
Authorization: Bearer <token>

// Response 200
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PUT `/users/profile`
**Description** : Mise à jour profil
```typescript
// Request
{
  firstName?: string;
  lastName?: string;
  country?: string;
  avatar?: string;      // URL ou base64
}

// Response 200
{ user: UserProfile }

// Errors
400: ValidationError
404: NotFoundError
```

#### DELETE `/users/account`
**Description** : Suppression compte
```typescript
// Response 200
{ message: "Account deleted successfully" }

// Side effects
// - Soft delete user
// - Archive associated listings
// - Invalidate all tokens
```

---

### 📋 Listings (`/listings`)

#### GET `/listings`
**Description** : Liste des annonces avec pagination/filtres
```typescript
// Query params
{
  page?: number;        // default: 1
  limit?: number;       // default: 20, max: 100
  category?: string;    // electronics, furniture, etc.
  country?: string;     // filter by country
  minPrice?: number;
  maxPrice?: number;
  search?: string;      // title/description search
  sortBy?: 'price' | 'date' | 'popularity';
  order?: 'asc' | 'desc';
}

// Response 200
{
  listings: Listing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: string[];
    countries: string[];
    priceRange: { min: number; max: number };
  };
}
```

#### GET `/listings/:id`
**Description** : Détail d'une annonce
```typescript
// Response 200
{
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images: string[];     // URLs des images
  location: {
    country: string;
    city?: string;
    region?: string;
  };
  seller: {
    id: string;
    firstName: string;
    avatar?: string;
    memberSince: Date;
    rating?: number;
  };
  status: 'active' | 'sold' | 'reserved';
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

// Errors
404: NotFoundError
```

#### POST `/listings`
**Description** : Créer nouvelle annonce
```typescript
// Headers
Authorization: Bearer <token>

// Request
{
  title: string;           // max 100 chars
  description: string;     // max 2000 chars
  price: number;          // > 0
  currency: string;       // EUR, USD, etc.
  category: string;       // from predefined list
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images: string[];       // base64 or URLs, max 10
  location: {
    country: string;
    city?: string;
    region?: string;
  };
}

// Response 201
{ listing: Listing }

// Errors
400: ValidationError    // Champs manquants/invalides
413: PayloadTooLarge   // Images trop lourdes
429: RateLimitError    // Trop d'annonces créées
```

#### PUT `/listings/:id`
**Description** : Modifier annonce (propriétaire uniquement)
```typescript
// Headers
Authorization: Bearer <token>

// Request (tous champs optionnels)
{
  title?: string;
  description?: string;
  price?: number;
  condition?: string;
  images?: string[];
  status?: 'active' | 'sold' | 'reserved';
}

// Response 200
{ listing: Listing }

// Errors
403: ForbiddenError    // Pas le propriétaire
404: NotFoundError
```

#### DELETE `/listings/:id`
**Description** : Supprimer annonce
```typescript
// Response 200
{ message: "Listing deleted successfully" }

// Errors
403: ForbiddenError
404: NotFoundError
```

#### GET `/listings/my`
**Description** : Annonces de l'utilisateur connecté
```typescript
// Query params
{
  status?: 'active' | 'sold' | 'reserved';
  page?: number;
  limit?: number;
}

// Response 200
{
  listings: Listing[];
  pagination: PaginationMeta;
}
```

---

### 💬 Messages (`/messages`)

#### GET `/messages/conversations`
**Description** : Conversations de l'utilisateur
```typescript
// Response 200
{
  conversations: {
    id: string;
    listing: {
      id: string;
      title: string;
      image?: string;
    };
    participant: {
      id: string;
      firstName: string;
      avatar?: string;
    };
    lastMessage: {
      content: string;
      sentAt: Date;
      isRead: boolean;
    };
    unreadCount: number;
  }[];
}
```

#### GET `/messages/:conversationId`
**Description** : Messages d'une conversation
```typescript
// Response 200
{
  messages: {
    id: string;
    content: string;
    senderId: string;
    sentAt: Date;
    isRead: boolean;
  }[];
}
```

#### POST `/messages`
**Description** : Envoyer message
```typescript
// Request
{
  listingId: string;      // Si nouveau conversation
  recipientId?: string;   // Si conversation existante
  content: string;        // max 1000 chars
}

// Response 201
{ message: Message }
```

---

### 📊 Categories (`/categories`)

#### GET `/categories`
**Description** : Liste des catégories disponibles
```typescript
// Response 200
{
  categories: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    subcategories?: Category[];
  }[];
}
```

---

## 🔒 Sécurité & Middleware

### Authentication Middleware
```typescript
// Vérifie JWT token sur routes protégées
// Headers: Authorization: Bearer <token>
// Ajoute req.user si token valide
```

### Rate Limiting
```typescript
// Général : 100 req/15min par IP
// Auth : 5 tentatives/15min par IP  
// Upload : 10 images/jour par user
```

### Validation (Zod)
```typescript
// Tous les inputs validés avec Zod schemas
// Sanitization automatique des strings
// Types TypeScript générés depuis schemas
```

### CORS Configuration
```typescript
// Origins autorisées selon ENV
// Credentials: true pour JWT cookies
// Headers exposés : X-Total-Count, etc.
```

---

## 🗄️ Base de données PostgreSQL

### Schéma principal

#### Table `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  status user_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table `listings`
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  category_id UUID REFERENCES categories(id),
  condition listing_condition NOT NULL,
  status listing_status DEFAULT 'active',
  location JSONB NOT NULL,
  images TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Migrations
```bash
# Créer migration
pnpm migrate:create add_new_feature

# Appliquer migrations
pnpm migrate:up

# Rollback
pnpm migrate:down
```

---

## 🧪 Tests & Qualité

### Tests E2E (Vitest + Supertest)
```typescript
// Structure des tests
describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should create user with valid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(validUserData)
        .expect(201);
        
      expect(response.body.user).toMatchSchema(UserSchema);
      expect(response.body.token).toBeDefined();
    });
  });
});
```

### Validation Zod
```typescript
// Exemple schema
export const CreateListingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  category: z.string().uuid(),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  images: z.array(z.string().url()).max(10),
  location: LocationSchema
});
```

### Scripts de test
```bash
pnpm test              # Tous les tests
pnpm test:watch        # Mode watch
pnpm test:coverage     # Avec couverture
pnpm test:e2e          # Tests E2E uniquement
```

---

## 🚀 Patterns & Best Practices

### Repository Pattern
```typescript
// Interface (Domain)
interface ListingRepository {
  create(listing: CreateListingDTO): Promise<Listing>;
  findById(id: string): Promise<Listing | null>;
  findByUser(userId: string): Promise<Listing[]>;
  update(id: string, data: UpdateListingDTO): Promise<Listing>;
  delete(id: string): Promise<void>;
}

// Implémentation (Infrastructure)
class PostgresListingRepository implements ListingRepository {
  // Implémentation avec pg
}
```

### Use Cases (Application)
```typescript
class CreateListingUseCase {
  constructor(
    private listingRepo: ListingRepository,
    private userRepo: UserRepository,
    private imageService: ImageService
  ) {}

  async execute(data: CreateListingDTO, userId: string): Promise<Listing> {
    // 1. Validation métier
    // 2. Upload images
    // 3. Création listing
    // 4. Notifications
    return listing;
  }
}
```

### Error Handling
```typescript
// Erreurs métier custom
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Middleware global
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  // ...
});
```

---

## 📊 Monitoring & Performance

### Métriques essentielles
- Response times par endpoint
- Taux d'erreurs 4xx/5xx
- Charge base de données
- Utilisation mémoire/CPU

### Logging (Morgan + Custom)
```typescript
// Logs structurés
logger.info('User created', { 
  userId, 
  email: user.email,
  timestamp: new Date().toISOString() 
});
```

### Caching Strategy
- Redis pour sessions JWT blacklist
- Cache query fréquentes (categories, etc.)
- CDN pour images upload

---

## 🔧 Configuration & Déploiement

### Variables d'environnement
```bash
# Obligatoires
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3000

# Email
RESEND_API_KEY=re_...
MAILGUN_API_KEY=...

# Upload
CLOUDINARY_URL=cloudinary://...
MAX_UPLOAD_SIZE=10485760  # 10MB
```

### Scripts package.json
```json
{
  "dev": "ts-node-dev --respawn src/index.ts",
  "build": "tsc && tsc-alias",
  "start": "node dist/index.js",
  "test": "vitest",
  "migrate:up": "node-pg-migrate up",
  "migrate:create": "node-pg-migrate create"
}
```

---

## 🎯 Règles spécifiques Backend

### Architecture
1. **Domain d'abord** : Toujours commencer par modéliser le domain
2. **Use Cases** : Un use case = une fonctionnalité métier
3. **Repositories** : Abstraction de la persistence
4. **Services** : Logic métier complexe ou intégrations externes

### Code Quality
1. **Types stricts** : Pas de `any`, interfaces explicites
2. **Validation** : Zod pour tous les inputs
3. **Tests** : Couverture > 80%, tests E2E critiques
4. **Documentation** : JSDoc pour functions publiques

### Performance
1. **Pagination** : Toujours paginer les listes
2. **Indexes** : DB indexes sur foreign keys et colonnes fréquentes
3. **Lazy loading** : Relations chargées à la demande
4. **Compression** : Gzip sur responses > 1KB

---

**🔗 Navigation** : Retour à la [documentation centrale](../claude.md) | App mobile : [`/xpatmart/claude.md`](../xpatmart/claude.md)