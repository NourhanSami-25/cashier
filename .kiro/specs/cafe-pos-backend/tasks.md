# Implementation Plan: Cafe POS Backend

## Overview

This implementation plan breaks down the backend development into discrete, incremental tasks. Each task builds on previous work, ensuring continuous integration and validation. The plan follows the layered architecture pattern, starting with foundational components (database, models, repositories) and building up to business logic (services) and HTTP handling (controllers, routes).

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Node.js project with TypeScript
  - Install dependencies: express, better-sqlite3, cors, dotenv, uuid, typescript, ts-node, nodemon, jest, supertest, @types packages
  - Configure TypeScript (tsconfig.json) with strict mode
  - Configure Jest for TypeScript testing
  - Create project directory structure: src/{config,models,repositories,services,controllers,routes,utils}
  - Set up nodemon for development
  - Create .env file with PORT, DATABASE_PATH, NODE_ENV
  - _Requirements: 8.1, 8.2, 11.1, 11.2_

- [x] 2. Database configuration and schema
  - [x] 2.1 Create database configuration module
    - Implement database connection using better-sqlite3
    - Create singleton pattern for database instance
    - Handle database file creation if not exists
    - _Requirements: 8.1_

  - [x] 2.2 Create database schema initialization
    - Write SQL for creating categories table
    - Write SQL for creating products table with foreign key to categories
    - Write SQL for creating invoices table
    - Write SQL for creating invoice_items table with foreign keys
    - Write SQL for creating settings table with single-row constraint
    - Implement schema migration on server startup
    - _Requirements: 8.2_

  - [x] 2.3 Seed initial settings data
    - Insert default tax rate (15%) and service rate (10%) if settings table is empty
    - _Requirements: 8.3_

- [x] 3. Define data models
  - Create TypeScript interfaces for Category, Product, Invoice, InvoiceItem, Settings
  - Export all models from models/index.ts
  - No business logic in models (pure data structures)
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 4. Implement Repository Layer
  - [x] 4.1 Implement CategoryRepository
    - create(name): Create new category with UUID
    - findAll(): Retrieve all categories
    - findById(id): Retrieve category by ID
    - delete(id): Delete category by ID
    - _Requirements: 2.1, 2.3_

  - [x] 4.2 Write property test for CategoryRepository
    - **Property 7: Category persistence and retrieval**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 4.3 Implement ProductRepository
    - create(name, price, categoryId): Create new product with UUID
    - findAll(): Retrieve all products
    - findById(id): Retrieve product by ID
    - findByCategoryId(categoryId): Retrieve products by category
    - update(id, name, price, categoryId): Update product
    - delete(id): Delete product by ID
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

  - [x] 4.4 Write property tests for ProductRepository
    - **Property 1: Valid product persistence**
    - **Validates: Requirements 1.1**

  - [x] 4.5 Implement InvoiceRepository
    - create(): Create new invoice with UUID and invoice number
    - findById(id): Retrieve invoice by ID with all items
    - findByDateRange(startDate, endDate): Retrieve invoices in date range
    - update(invoice): Update invoice totals
    - complete(id, completedAt): Mark invoice as completed
    - _Requirements: 3.1, 3.7, 6.1_

  - [x] 4.6 Implement InvoiceItemRepository
    - create(invoiceId, productId, productName, productPrice, quantity): Create invoice item
    - findByInvoiceId(invoiceId): Retrieve all items for an invoice
    - findById(id): Retrieve invoice item by ID
    - update(id, quantity): Update item quantity
    - delete(id): Delete invoice item
    - _Requirements: 3.2, 3.4, 3.5_

  - [x] 4.7 Implement SettingsRepository
    - getSettings(): Retrieve current settings
    - updateTaxRate(rate): Update tax rate
    - updateServiceRate(rate): Update service rate
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Checkpoint - Ensure repository tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Service Layer - Product and Category Services
  - [x] 6.1 Implement ProductService
    - validateProduct(name, price): Validate product data (throw on invalid)
    - createProduct(name, price, categoryId): Validate then create via repository
    - getAllProducts(): Retrieve all products via repository
    - getProductById(id): Retrieve product by ID via repository
    - updateProduct(id, name, price, categoryId): Validate then update via repository
    - deleteProduct(id): Delete product via repository
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 6.2 Write property tests for ProductService validation
    - **Property 2: Empty name rejection**
    - **Validates: Requirements 1.2**

  - [ ] 6.3 Write property test for non-positive price rejection
    - **Property 3: Non-positive price rejection**
    - **Validates: Requirements 1.3**

  - [ ] 6.4 Write property test for product update
    - **Property 4: Product update persistence**
    - **Validates: Requirements 1.4**

  - [ ] 6.5 Write property test for product deletion
    - **Property 5: Product deletion completeness**
    - **Validates: Requirements 1.5**

  - [x] 6.6 Implement CategoryService
    - createCategory(name): Create category via repository
    - getAllCategories(): Retrieve all categories via repository
    - getCategoryById(id): Retrieve category by ID via repository
    - deleteCategory(id): Delete category via repository
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 6.7 Write property test for category list completeness
    - **Property 8: Category list completeness**
    - **Validates: Requirements 2.3**

- [ ] 7. Implement Service Layer - Invoice Service
  - [x] 7.1 Implement invoice calculation utilities
    - calculateLineTotal(price, quantity): Calculate single line total
    - calculateSubtotal(items): Sum all line totals
    - calculateServiceCharge(subtotal, serviceRate): Calculate service charge
    - calculateTax(subtotal, serviceCharge, taxRate): Calculate tax
    - calculateTotal(subtotal, serviceCharge, tax): Calculate final total
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 7.2 Write property tests for calculation utilities
    - **Property 15: Subtotal calculation correctness**
    - **Property 16: Service charge calculation correctness**
    - **Property 17: Tax calculation correctness**
    - **Property 18: Total calculation correctness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [x] 7.3 Implement InvoiceService core methods
    - createInvoice(): Create empty invoice via repository
    - getInvoiceById(id): Retrieve invoice by ID via repository
    - calculateInvoiceTotals(invoice): Recalculate all totals for an invoice
    - _Requirements: 3.1, 4.5_

  - [ ] 7.4 Write property test for invoice initialization
    - **Property 9: Invoice initialization uniqueness**
    - **Validates: Requirements 3.1**

  - [x] 7.5 Implement InvoiceService item management
    - addItemToInvoice(invoiceId, productId, quantity): Add item or increase quantity if exists
    - updateItemQuantity(invoiceId, itemId, quantity): Update quantity and recalculate
    - removeItemFromInvoice(invoiceId, itemId): Remove item and recalculate
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 4.5_

  - [ ] 7.6 Write property test for item addition
    - **Property 10: Item addition correctness**
    - **Validates: Requirements 3.2**

  - [ ] 7.7 Write property test for duplicate item handling
    - **Property 11: Duplicate item quantity aggregation**
    - **Validates: Requirements 3.3**

  - [ ] 7.8 Write property test for item quantity update
    - **Property 12: Item quantity update with recalculation**
    - **Validates: Requirements 3.4**

  - [ ] 7.9 Write property test for item removal
    - **Property 13: Item removal with recalculation**
    - **Validates: Requirements 3.5**

  - [x] 7.10 Implement InvoiceService completion
    - completeInvoice(invoiceId): Validate invoice has items, mark as completed
    - Throw error if invoice is empty
    - _Requirements: 3.6, 3.7_

  - [ ] 7.11 Write unit test for empty invoice completion rejection
    - Test that completing an empty invoice throws an error
    - _Requirements: 3.6_

  - [ ] 7.12 Write property test for invoice completion
    - **Property 14: Invoice completion with items**
    - **Validates: Requirements 3.7**

  - [ ] 7.13 Write property test for calculation consistency
    - **Property 19: Calculation consistency after modifications**
    - **Validates: Requirements 4.5**

- [ ] 8. Checkpoint - Ensure service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Service Layer - Report and Print Services
  - [x] 9.1 Implement ReportService
    - getDailyReport(date): Get all completed invoices for date
    - Calculate total sales, invoice count, revenue components
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 9.2 Write property tests for ReportService
    - **Property 21: Daily report date filtering**
    - **Property 22: Daily totals calculation**
    - **Property 23: Daily invoice count**
    - **Property 24: Daily revenue component calculation**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [x] 9.3 Implement PrintService
    - formatInvoiceForPrint(invoice): Format invoice as printable text
    - Include invoice number, date, items, quantities, prices, totals
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 9.4 Write property test for print formatting
    - **Property 25: Invoice print format completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [x] 9.5 Implement SettingsService
    - getSettings(): Retrieve settings via repository
    - updateTaxRate(rate): Update tax rate via repository
    - updateServiceRate(rate): Update service rate via repository
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 9.6 Write property test for settings persistence
    - **Property 20: Settings persistence round-trip**
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [x] 10. Implement Controller Layer
  - [x] 10.1 Implement ProductController
    - createProduct(req, res): Parse request, call service, format response
    - getAllProducts(req, res): Call service, format response
    - getProductById(req, res): Parse ID, call service, format response
    - updateProduct(req, res): Parse request, call service, format response
    - deleteProduct(req, res): Parse ID, call service, format response
    - Handle errors and return appropriate HTTP status codes
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 10.2 Implement CategoryController
    - createCategory(req, res): Parse request, call service, format response
    - getAllCategories(req, res): Call service, format response
    - getCategoryById(req, res): Parse ID, call service, format response
    - deleteCategory(req, res): Parse ID, call service, format response
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 10.3 Implement InvoiceController
    - createInvoice(req, res): Call service, format response
    - getInvoiceById(req, res): Parse ID, call service, format response
    - addItemToInvoice(req, res): Parse request, call service, format response
    - updateItemQuantity(req, res): Parse request, call service, format response
    - removeItemFromInvoice(req, res): Parse IDs, call service, format response
    - completeInvoice(req, res): Parse ID, call service, format response
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 10.4 Implement ReportController
    - getDailyReport(req, res): Parse date, call service, format response
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 10.5 Implement SettingsController
    - getSettings(req, res): Call service, format response
    - updateTaxRate(req, res): Parse request, call service, format response
    - updateServiceRate(req, res): Parse request, call service, format response
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 11. Implement Routes Layer
  - [x] 11.1 Create product routes
    - GET /api/products → ProductController.getAllProducts
    - POST /api/products → ProductController.createProduct
    - GET /api/products/:id → ProductController.getProductById
    - PUT /api/products/:id → ProductController.updateProduct
    - DELETE /api/products/:id → ProductController.deleteProduct
    - _Requirements: 9.1_

  - [x] 11.2 Create category routes
    - GET /api/categories → CategoryController.getAllCategories
    - POST /api/categories → CategoryController.createCategory
    - GET /api/categories/:id → CategoryController.getCategoryById
    - DELETE /api/categories/:id → CategoryController.deleteCategory
    - _Requirements: 9.1_

  - [x] 11.3 Create invoice routes
    - POST /api/invoices → InvoiceController.createInvoice
    - GET /api/invoices/:id → InvoiceController.getInvoiceById
    - POST /api/invoices/:id/items → InvoiceController.addItemToInvoice
    - PUT /api/invoices/:id/items/:itemId → InvoiceController.updateItemQuantity
    - DELETE /api/invoices/:id/items/:itemId → InvoiceController.removeItemFromInvoice
    - POST /api/invoices/:id/complete → InvoiceController.completeInvoice
    - _Requirements: 9.1_

  - [x] 11.4 Create report routes
    - GET /api/reports/daily → ReportController.getDailyReport
    - _Requirements: 9.1_

  - [x] 11.5 Create settings routes
    - GET /api/settings → SettingsController.getSettings
    - PUT /api/settings/tax → SettingsController.updateTaxRate
    - PUT /api/settings/service → SettingsController.updateServiceRate
    - _Requirements: 9.1_

- [ ] 12. Implement Express application setup
  - [x] 12.1 Create Express app configuration
    - Initialize Express app
    - Configure JSON body parser
    - Configure CORS with environment-based origin
    - Mount all route handlers
    - _Requirements: 9.4_

  - [x] 12.2 Implement centralized error handler
    - Create error handler middleware
    - Map error types to HTTP status codes
    - Format error responses consistently
    - Log errors for debugging
    - _Requirements: 9.2, 9.3_

  - [ ] 12.3 Write property test for error handling
    - **Property 26: Invalid request error responses**
    - **Validates: Requirements 9.2, 9.3**

  - [x] 12.4 Create server startup script
    - Initialize database and schema
    - Start Express server on configured port
    - Log server startup information
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 13. Integration testing
  - [ ] 13.1 Write integration tests for product API
    - Test full request/response cycle for all product endpoints
    - Test error cases (invalid data, not found)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 13.2 Write integration tests for invoice API
    - Test invoice creation, item management, completion
    - Test calculation accuracy through API
    - Test error cases (empty invoice completion, invalid IDs)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 13.3 Write integration tests for report API
    - Test daily report generation
    - Test date filtering and calculations
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 14. Final checkpoint - Full system validation
  - Run all tests (unit, property, integration)
  - Verify all requirements are met
  - Test manual API calls with Postman or curl
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end API functionality
- All tests are required for comprehensive coverage and correctness validation

