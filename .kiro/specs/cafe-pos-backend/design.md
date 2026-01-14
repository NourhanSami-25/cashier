# Design Document

## Overview

The Cafe POS Backend is a Node.js-based RESTful API server that implements all business logic for a point-of-sale system. The system follows a layered architecture pattern with clear separation between data access, business logic, and HTTP handling layers. The backend uses SQLite for local data persistence and is designed to be framework-agnostic, allowing deployment as both a web application and a desktop application (via Electron or Tauri).

The system handles product and category management, invoice processing with automatic calculation of taxes and service charges, daily reporting, and invoice printing capabilities. All business rules and calculations are centralized in the service layer, ensuring consistency and testability.

## Architecture

### Layered Architecture Pattern

The system follows a strict layered architecture with the following layers:

```
┌─────────────────────────────────────┐
│         HTTP Layer (Routes)         │
│  - Express routes                   │
│  - Request/Response handling        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Controller Layer               │
│  - Request validation               │
│  - Response formatting              │
│  - Error handling                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Service Layer                 │
│  - Business logic                   │
│  - Validation rules                 │
│  - Calculations                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Repository Layer               │
│  - Database operations              │
│  - SQL queries                      │
│  - Data mapping                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Database (SQLite)           │
└─────────────────────────────────────┘
```

### Layer Responsibilities

**Routes Layer:**
- Define HTTP endpoints
- Map HTTP methods to controller actions
- No business logic

**Controller Layer:**
- Parse HTTP requests
- Call appropriate service methods
- Format HTTP responses
- Handle HTTP-specific errors
- No business logic or database access

**Service Layer:**
- Implement all business logic
- Perform validation
- Execute calculations
- Coordinate repository calls
- No HTTP concerns or direct database access

**Repository Layer:**
- Execute SQL queries
- Map database rows to domain models
- Handle database connections
- No business logic or validation

### Technology Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** SQLite (better-sqlite3)
- **Language:** TypeScript
- **Testing:** Jest + Supertest
- **Utilities:** uuid, cors, dotenv

## Components and Interfaces

### Models

Models are pure data structures with no behavior. They represent domain entities.

#### Category Model
```typescript
interface Category {
  id: string;
  name: string;
  createdAt: Date;
}
```

#### Product Model
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  createdAt: Date;
}
```

#### Invoice Model
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: Date;
  completedAt: Date | null;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
}
```

#### InvoiceItem Model
```typescript
interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
}
```

#### Settings Model
```typescript
interface Settings {
  taxRate: number;      // e.g., 0.15 for 15%
  serviceRate: number;  // e.g., 0.10 for 10%
}
```

### Repository Interfaces

#### CategoryRepository
```typescript
interface CategoryRepository {
  create(name: string): Category;
  findAll(): Category[];
  findById(id: string): Category | null;
  delete(id: string): boolean;
}
```

#### ProductRepository
```typescript
interface ProductRepository {
  create(name: string, price: number, categoryId: string): Product;
  findAll(): Product[];
  findById(id: string): Product | null;
  findByCategoryId(categoryId: string): Product[];
  update(id: string, name: string, price: number, categoryId: string): Product | null;
  delete(id: string): boolean;
}
```

#### InvoiceRepository
```typescript
interface InvoiceRepository {
  create(): Invoice;
  findById(id: string): Invoice | null;
  findByDateRange(startDate: Date, endDate: Date): Invoice[];
  update(invoice: Invoice): Invoice;
  complete(id: string, completedAt: Date): Invoice | null;
}
```

#### InvoiceItemRepository
```typescript
interface InvoiceItemRepository {
  create(invoiceId: string, productId: string, productName: string, 
         productPrice: number, quantity: number): InvoiceItem;
  findByInvoiceId(invoiceId: string): InvoiceItem[];
  findById(id: string): InvoiceItem | null;
  update(id: string, quantity: number): InvoiceItem | null;
  delete(id: string): boolean;
}
```

#### SettingsRepository
```typescript
interface SettingsRepository {
  getSettings(): Settings;
  updateTaxRate(rate: number): Settings;
  updateServiceRate(rate: number): Settings;
}
```

### Service Interfaces

#### ProductService
```typescript
interface ProductService {
  createProduct(name: string, price: number, categoryId: string): Product;
  getAllProducts(): Product[];
  getProductById(id: string): Product | null;
  updateProduct(id: string, name: string, price: number, categoryId: string): Product;
  deleteProduct(id: string): boolean;
  validateProduct(name: string, price: number): void; // throws on invalid
}
```

#### CategoryService
```typescript
interface CategoryService {
  createCategory(name: string): Category;
  getAllCategories(): Category[];
  getCategoryById(id: string): Category | null;
  deleteCategory(id: string): boolean;
}
```

#### InvoiceService
```typescript
interface InvoiceService {
  createInvoice(): Invoice;
  getInvoiceById(id: string): Invoice | null;
  addItemToInvoice(invoiceId: string, productId: string, quantity: number): Invoice;
  updateItemQuantity(invoiceId: string, itemId: string, quantity: number): Invoice;
  removeItemFromInvoice(invoiceId: string, itemId: string): Invoice;
  completeInvoice(invoiceId: string): Invoice;
  calculateInvoiceTotals(invoice: Invoice): Invoice;
}
```

#### ReportService
```typescript
interface ReportService {
  getDailyReport(date: Date): DailyReport;
}

interface DailyReport {
  date: Date;
  totalSales: number;
  invoiceCount: number;
  totalRevenue: number;
  totalServiceCharges: number;
  totalTaxes: number;
  invoices: Invoice[];
}
```

#### PrintService
```typescript
interface PrintService {
  formatInvoiceForPrint(invoice: Invoice): string;
}
```

### Controller Interfaces

#### ProductController
```typescript
interface ProductController {
  createProduct(req: Request, res: Response): Promise<void>;
  getAllProducts(req: Request, res: Response): Promise<void>;
  getProductById(req: Request, res: Response): Promise<void>;
  updateProduct(req: Request, res: Response): Promise<void>;
  deleteProduct(req: Request, res: Response): Promise<void>;
}
```

#### InvoiceController
```typescript
interface InvoiceController {
  createInvoice(req: Request, res: Response): Promise<void>;
  getInvoiceById(req: Request, res: Response): Promise<void>;
  addItemToInvoice(req: Request, res: Response): Promise<void>;
  updateItemQuantity(req: Request, res: Response): Promise<void>;
  removeItemFromInvoice(req: Request, res: Response): Promise<void>;
  completeInvoice(req: Request, res: Response): Promise<void>;
}
```

#### ReportController
```typescript
interface ReportController {
  getDailyReport(req: Request, res: Response): Promise<void>;
}
```

## Data Models

### Database Schema

#### categories table
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### products table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### invoices table
```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  subtotal REAL NOT NULL DEFAULT 0,
  service_charge REAL NOT NULL DEFAULT 0,
  tax REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0
);
```

#### invoice_items table
```sql
CREATE TABLE invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  line_total REAL NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### settings table
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  tax_rate REAL NOT NULL DEFAULT 0.15,
  service_rate REAL NOT NULL DEFAULT 0.10
);
```

### Business Rules and Calculations

#### Invoice Calculation Algorithm

Given an invoice with items, the calculation proceeds as follows:

1. **Calculate Line Totals:**
   ```
   For each item:
     lineTotal = productPrice × quantity
   ```

2. **Calculate Subtotal:**
   ```
   subtotal = sum of all lineTotals
   ```

3. **Calculate Service Charge:**
   ```
   serviceCharge = subtotal × serviceRate
   ```

4. **Calculate Tax:**
   ```
   taxableAmount = subtotal + serviceCharge
   tax = taxableAmount × taxRate
   ```

5. **Calculate Total:**
   ```
   total = subtotal + serviceCharge + tax
   ```

#### Product Validation Rules

- Product name must not be empty or whitespace-only
- Product price must be greater than 0
- Category ID must reference an existing category

#### Invoice Validation Rules

- An invoice cannot be completed if it has no items
- Item quantities must be positive integers
- An invoice cannot be modified after completion

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Product Management Properties

**Property 1: Valid product persistence**
*For any* product with a non-empty name and positive price, creating the product should result in the product being retrievable from the database with identical data.
**Validates: Requirements 1.1**

**Property 2: Empty name rejection**
*For any* string composed entirely of whitespace characters, attempting to create a product with that name should be rejected with an error.
**Validates: Requirements 1.2**

**Property 3: Non-positive price rejection**
*For any* price value less than or equal to zero, attempting to create a product with that price should be rejected with an error.
**Validates: Requirements 1.3**

**Property 4: Product update persistence**
*For any* existing product and valid update data, updating the product should result in the updated data being retrievable from the database.
**Validates: Requirements 1.4**

**Property 5: Product deletion completeness**
*For any* existing product, deleting the product should result in the product no longer being retrievable from the database.
**Validates: Requirements 1.5**

**Property 6: Product retrieval completeness**
*For any* set of products in the database, retrieving all products should return exactly that set with no additions or omissions.
**Validates: Requirements 1.6**

### Category Management Properties

**Property 7: Category persistence and retrieval**
*For any* valid category, creating the category should result in it being retrievable with all associated products.
**Validates: Requirements 2.1, 2.2**

**Property 8: Category list completeness**
*For any* set of categories in the database, retrieving all categories should return exactly that set.
**Validates: Requirements 2.3**

### Invoice Management Properties

**Property 9: Invoice initialization uniqueness**
*For any* sequence of invoice creations, each invoice should have a unique identifier and a valid timestamp.
**Validates: Requirements 3.1**

**Property 10: Item addition correctness**
*For any* invoice and product, adding the product with a specified quantity should result in the invoice containing that item with the correct quantity.
**Validates: Requirements 3.2**

**Property 11: Duplicate item quantity aggregation**
*For any* invoice and product, adding the same product twice should result in a single line item with the sum of the quantities, not two separate line items.
**Validates: Requirements 3.3**

**Property 12: Item quantity update with recalculation**
*For any* invoice item, updating its quantity should result in both the quantity being changed and all invoice totals being recalculated correctly.
**Validates: Requirements 3.4**

**Property 13: Item removal with recalculation**
*For any* invoice item, removing it should result in the item no longer appearing in the invoice and all totals being recalculated correctly.
**Validates: Requirements 3.5**

**Property 14: Invoice completion with items**
*For any* invoice containing at least one item, completing the invoice should mark it as completed and persist it to the database.
**Validates: Requirements 3.7**

### Invoice Calculation Properties

**Property 15: Subtotal calculation correctness**
*For any* invoice with items, the subtotal should equal the sum of (productPrice × quantity) for all items.
**Validates: Requirements 4.1**

**Property 16: Service charge calculation correctness**
*For any* invoice subtotal and service rate, the service charge should equal subtotal × serviceRate.
**Validates: Requirements 4.2**

**Property 17: Tax calculation correctness**
*For any* invoice with subtotal and service charge, the tax should equal (subtotal + serviceCharge) × taxRate.
**Validates: Requirements 4.3**

**Property 18: Total calculation correctness**
*For any* invoice, the total should equal subtotal + serviceCharge + tax.
**Validates: Requirements 4.4**

**Property 19: Calculation consistency after modifications**
*For any* invoice, after adding, removing, or updating any item, recalculating the totals from scratch should produce the same values as the stored totals.
**Validates: Requirements 4.5**

### Settings Management Properties

**Property 20: Settings persistence round-trip**
*For any* valid tax rate and service rate, updating the settings and then retrieving them should return the exact same rates.
**Validates: Requirements 5.2, 5.3, 5.4**

### Reporting Properties

**Property 21: Daily report date filtering**
*For any* specific date and set of invoices, the daily report should include only completed invoices from that date.
**Validates: Requirements 6.1**

**Property 22: Daily totals calculation**
*For any* set of completed invoices for a date, the daily total should equal the sum of all invoice totals.
**Validates: Requirements 6.2**

**Property 23: Daily invoice count**
*For any* set of completed invoices for a date, the invoice count should equal the number of invoices in that set.
**Validates: Requirements 6.3**

**Property 24: Daily revenue component calculation**
*For any* set of completed invoices for a date, the sum of subtotals, service charges, and taxes should equal the respective sums across all invoices.
**Validates: Requirements 6.4**

### Print Formatting Properties

**Property 25: Invoice print format completeness**
*For any* invoice, the formatted print output should contain the invoice number, date, all items with their quantities and prices, and all calculated totals (subtotal, service charge, tax, total).
**Validates: Requirements 7.1, 7.2, 7.3**

### Error Handling Properties

**Property 26: Invalid request error responses**
*For any* invalid API request (malformed data, missing required fields, invalid IDs), the system should return an appropriate HTTP error status code (4xx) and a descriptive error message.
**Validates: Requirements 9.2, 9.3**



## Error Handling

### Error Categories

The system handles errors in the following categories:

1. **Validation Errors (400 Bad Request)**
   - Empty or whitespace-only product names
   - Non-positive product prices
   - Invalid category references
   - Empty invoices on completion
   - Invalid quantity values

2. **Not Found Errors (404 Not Found)**
   - Product ID not found
   - Category ID not found
   - Invoice ID not found
   - Invoice item ID not found

3. **Business Logic Errors (422 Unprocessable Entity)**
   - Attempting to modify a completed invoice
   - Attempting to complete an empty invoice

4. **Server Errors (500 Internal Server Error)**
   - Database connection failures
   - Unexpected exceptions during processing

### Error Response Format

All errors return a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  }
}
```

Example:
```json
{
  "error": {
    "message": "Product name cannot be empty",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "name"
    }
  }
}
```

### Error Handling Strategy

**Controller Layer:**
- Catches exceptions from service layer
- Maps exceptions to appropriate HTTP status codes
- Formats error responses consistently
- Logs errors for debugging

**Service Layer:**
- Throws typed exceptions for different error conditions
- Includes descriptive error messages
- Does not handle HTTP concerns

**Repository Layer:**
- Throws exceptions for database errors
- Does not handle business logic errors

### Centralized Error Handler

Express middleware handles all uncaught errors:

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error
  console.error(err);
  
  // Determine status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});
```

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests and property-based tests to ensure comprehensive coverage and correctness validation.

**Unit Tests:**
- Verify specific examples and edge cases
- Test integration points between components
- Validate error conditions and error messages
- Test database initialization and migrations

**Property-Based Tests:**
- Verify universal properties across all inputs
- Test calculations with randomized data
- Validate business rules hold for all valid inputs
- Ensure consistency after state modifications

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs and validate specific scenarios, while property-based tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Framework:** fast-check (for TypeScript/JavaScript)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: cafe-pos-backend, Property N: [property description]`

**Example:**
```typescript
import fc from 'fast-check';

// Feature: cafe-pos-backend, Property 15: Subtotal calculation correctness
test('invoice subtotal equals sum of line totals', () => {
  fc.assert(
    fc.property(
      fc.array(invoiceItemArbitrary(), { minLength: 1, maxLength: 10 }),
      (items) => {
        const invoice = createInvoiceWithItems(items);
        const expectedSubtotal = items.reduce(
          (sum, item) => sum + (item.price * item.quantity),
          0
        );
        expect(invoice.subtotal).toBeCloseTo(expectedSubtotal, 2);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Organization

```
tests/
├── unit/
│   ├── services/
│   │   ├── productService.test.ts
│   │   ├── invoiceService.test.ts
│   │   ├── reportService.test.ts
│   │   └── printService.test.ts
│   ├── repositories/
│   │   ├── productRepository.test.ts
│   │   ├── invoiceRepository.test.ts
│   │   └── settingsRepository.test.ts
│   └── utils/
│       └── calculations.test.ts
├── property/
│   ├── productService.property.test.ts
│   ├── invoiceService.property.test.ts
│   ├── calculations.property.test.ts
│   └── reportService.property.test.ts
└── integration/
    ├── productApi.test.ts
    ├── invoiceApi.test.ts
    └── reportApi.test.ts
```

### Unit Test Coverage

**Service Layer Tests:**
- Product validation (empty names, non-positive prices)
- Invoice calculation edge cases (empty invoices, single item, multiple items)
- Settings updates and retrieval
- Report generation for various date ranges
- Print formatting with different invoice structures

**Repository Layer Tests:**
- CRUD operations for all entities
- Foreign key constraints
- Unique constraints
- Date range queries

**Integration Tests:**
- Full API request/response cycles
- Error handling and status codes
- CORS configuration
- Database initialization

### Property-Based Test Coverage

Each correctness property from the design document should be implemented as a property-based test:

- **Properties 1-6:** Product management operations
- **Properties 7-8:** Category management operations
- **Properties 9-14:** Invoice management operations
- **Properties 15-19:** Invoice calculation correctness
- **Property 20:** Settings persistence
- **Properties 21-24:** Reporting calculations
- **Property 25:** Print formatting completeness
- **Property 26:** Error handling consistency

### Test Data Generators

Property-based tests require custom generators (arbitraries) for domain objects:

```typescript
// Product generator
const productArbitrary = () => fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  price: fc.float({ min: 0.01, max: 1000, noNaN: true }),
  categoryId: fc.uuid()
});

// Invoice item generator
const invoiceItemArbitrary = () => fc.record({
  productId: fc.uuid(),
  productName: fc.string({ minLength: 1, maxLength: 50 }),
  productPrice: fc.float({ min: 0.01, max: 1000, noNaN: true }),
  quantity: fc.integer({ min: 1, max: 100 })
});

// Invalid product name generator (whitespace only)
const invalidNameArbitrary = () => fc.oneof(
  fc.constant(''),
  fc.constant(' '),
  fc.constant('  '),
  fc.constant('\t'),
  fc.constant('\n'),
  fc.string().filter(s => s.trim().length === 0 && s.length > 0)
);
```

### Testing Best Practices

1. **Isolation:** Each test should be independent and not rely on other tests
2. **Database Reset:** Use a fresh database or transaction rollback for each test
3. **Deterministic:** Unit tests should be deterministic; property tests handle randomization
4. **Fast Execution:** Tests should run quickly to enable frequent execution
5. **Clear Assertions:** Test failures should clearly indicate what went wrong
6. **Edge Cases:** Explicitly test boundary conditions (empty, zero, maximum values)
7. **Error Paths:** Test both success and failure scenarios

### Continuous Integration

Tests should run automatically on:
- Every commit (pre-commit hook)
- Every pull request
- Before deployment

Target: 100% pass rate before merging or deploying.

## API Routes

### Product Routes

```
GET    /api/products           - Get all products
POST   /api/products           - Create a new product
GET    /api/products/:id       - Get product by ID
PUT    /api/products/:id       - Update product
DELETE /api/products/:id       - Delete product
```

### Category Routes

```
GET    /api/categories         - Get all categories
POST   /api/categories         - Create a new category
GET    /api/categories/:id     - Get category by ID
DELETE /api/categories/:id     - Delete category
```

### Invoice Routes

```
POST   /api/invoices                      - Create a new invoice
GET    /api/invoices/:id                  - Get invoice by ID
POST   /api/invoices/:id/items            - Add item to invoice
PUT    /api/invoices/:id/items/:itemId    - Update item quantity
DELETE /api/invoices/:id/items/:itemId    - Remove item from invoice
POST   /api/invoices/:id/complete         - Complete invoice
```

### Report Routes

```
GET    /api/reports/daily?date=YYYY-MM-DD - Get daily report
```

### Settings Routes

```
GET    /api/settings           - Get current settings
PUT    /api/settings/tax       - Update tax rate
PUT    /api/settings/service   - Update service rate
```

## Deployment Considerations

### Web Deployment

- Run as a standard Node.js server
- Listen on configurable port (default: 3000)
- SQLite database file stored in `./data/cafe_pos.db`
- Environment variables for configuration

### Desktop Deployment (Electron/Tauri)

- Backend runs as localhost server on random available port
- Frontend connects to `http://localhost:{port}`
- Database file stored in user data directory
- No external network access required
- Single executable bundle

### Environment Variables

```
PORT=3000
DATABASE_PATH=./data/cafe_pos.db
NODE_ENV=development|production
CORS_ORIGIN=http://localhost:5173
```

## Future Enhancements

Potential future improvements (out of scope for initial implementation):

1. **Authentication & Authorization:** User login and role-based access control
2. **Multi-tenant Support:** Support multiple cafe locations
3. **Inventory Management:** Track stock levels and low-stock alerts
4. **Payment Integration:** Support multiple payment methods
5. **Customer Management:** Track customer information and loyalty programs
6. **Advanced Reporting:** More detailed analytics and visualizations
7. **Backup & Restore:** Automated database backups
8. **Export Functionality:** Export reports to PDF, Excel, CSV
9. **Real-time Updates:** WebSocket support for live updates
10. **Offline Mode:** Queue operations when offline and sync when online
