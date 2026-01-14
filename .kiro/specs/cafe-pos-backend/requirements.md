# Requirements Document

## Introduction

This document specifies the requirements for a backend system for a Cafe Point of Sale (POS) application. The backend will be built using Node.js, Express, and SQLite, following a layered architecture pattern. The system must handle all business logic including product management, invoice processing, tax and service calculations, and reporting capabilities. The backend is designed to be web-first but capable of being converted to a desktop application using Electron or Tauri.

## Glossary

- **Backend_System**: The Node.js server application that handles all business logic and data persistence
- **Product**: An item available for sale with a name, price, and category
- **Category**: A classification group for products
- **Invoice**: A sales transaction record containing items, quantities, and calculated totals
- **Invoice_Item**: A single line item in an invoice representing a product and its quantity
- **Subtotal**: The sum of all item prices before taxes and service charges
- **Service_Charge**: A percentage-based fee added to the subtotal
- **Tax**: A percentage-based tax calculated on the subtotal plus service charge
- **Total**: The final amount including subtotal, service charge, and tax
- **Repository**: A data access layer component that handles database operations
- **Service**: A business logic layer component that implements validation and calculations
- **Controller**: An HTTP request handler that coordinates between routes and services
- **Settings**: System configuration values including tax rate and service rate

## Requirements

### Requirement 1: Product Management

**User Story:** As a cafe manager, I want to manage products in the system, so that I can maintain an up-to-date menu of available items.

#### Acceptance Criteria

1. WHEN a product is created with valid data, THE Backend_System SHALL store the product in the database
2. WHEN a product is created with an empty name, THE Backend_System SHALL reject the creation and return an error
3. WHEN a product is created with a price less than or equal to zero, THE Backend_System SHALL reject the creation and return an error
4. WHEN a product is updated with valid data, THE Backend_System SHALL update the product in the database
5. WHEN a product is deleted, THE Backend_System SHALL remove the product from the database
6. WHEN all products are requested, THE Backend_System SHALL return a list of all products with their categories

### Requirement 2: Category Management

**User Story:** As a cafe manager, I want to organize products into categories, so that I can structure the menu logically.

#### Acceptance Criteria

1. WHEN a category is created with valid data, THE Backend_System SHALL store the category in the database
2. WHEN a category is requested, THE Backend_System SHALL return the category with all associated products
3. WHEN all categories are requested, THE Backend_System SHALL return a list of all categories

### Requirement 3: Invoice Creation and Management

**User Story:** As a cashier, I want to create and manage invoices, so that I can process customer sales transactions.

#### Acceptance Criteria

1. WHEN a new invoice is created, THE Backend_System SHALL initialize an empty invoice with a unique identifier and timestamp
2. WHEN an item is added to an invoice, THE Backend_System SHALL add the item with the specified quantity
3. WHEN an item is added that already exists in the invoice, THE Backend_System SHALL increase the quantity of the existing item
4. WHEN an item quantity is updated in an invoice, THE Backend_System SHALL update the quantity and recalculate totals
5. WHEN an item is removed from an invoice, THE Backend_System SHALL remove the item and recalculate totals
6. WHEN an invoice is completed with no items, THE Backend_System SHALL reject the completion and return an error
7. WHEN an invoice is completed with items, THE Backend_System SHALL mark the invoice as completed and persist it to the database

### Requirement 4: Invoice Calculations

**User Story:** As a cashier, I want the system to automatically calculate invoice totals, so that I can provide accurate pricing to customers.

#### Acceptance Criteria

1. WHEN items are added to an invoice, THE Backend_System SHALL calculate the subtotal as the sum of all item prices multiplied by their quantities
2. WHEN the subtotal is calculated, THE Backend_System SHALL calculate the service charge as a percentage of the subtotal
3. WHEN the service charge is calculated, THE Backend_System SHALL calculate the tax as a percentage of the subtotal plus service charge
4. WHEN all charges are calculated, THE Backend_System SHALL calculate the total as subtotal plus service charge plus tax
5. WHEN any item is added, removed, or updated, THE Backend_System SHALL recalculate all totals immediately

### Requirement 5: Settings Management

**User Story:** As a cafe manager, I want to configure tax and service rates, so that I can adjust pricing according to business requirements.

#### Acceptance Criteria

1. WHEN the system starts, THE Backend_System SHALL load tax rate and service rate from the settings table
2. WHEN a tax rate is updated, THE Backend_System SHALL persist the new rate to the database
3. WHEN a service rate is updated, THE Backend_System SHALL persist the new rate to the database
4. WHEN settings are requested, THE Backend_System SHALL return the current tax rate and service rate

### Requirement 6: Daily Reports

**User Story:** As a cafe manager, I want to view daily sales reports, so that I can track business performance.

#### Acceptance Criteria

1. WHEN a daily report is requested for a specific date, THE Backend_System SHALL return all completed invoices for that date
2. WHEN calculating daily totals, THE Backend_System SHALL sum the total amount from all completed invoices
3. WHEN calculating daily statistics, THE Backend_System SHALL count the number of completed invoices
4. WHEN calculating daily revenue, THE Backend_System SHALL sum the subtotal, service charges, and taxes separately

### Requirement 7: Invoice Printing

**User Story:** As a cashier, I want to print invoices, so that I can provide receipts to customers.

#### Acceptance Criteria

1. WHEN an invoice is requested for printing, THE Backend_System SHALL format the invoice data into a printable text representation
2. WHEN formatting an invoice, THE Backend_System SHALL include the invoice number, date, all items with quantities and prices, and all calculated totals
3. WHEN formatting an invoice, THE Backend_System SHALL display the subtotal, service charge, tax, and total clearly

### Requirement 8: Data Persistence

**User Story:** As a system administrator, I want all data to be persisted in a local database, so that data is preserved across application restarts.

#### Acceptance Criteria

1. WHEN the Backend_System starts, THE Backend_System SHALL create the database file if it does not exist
2. WHEN the Backend_System starts, THE Backend_System SHALL create all required tables if they do not exist
3. WHEN the Backend_System starts, THE Backend_System SHALL initialize default settings if no settings exist
4. WHEN data is written to the database, THE Backend_System SHALL ensure data integrity through proper transaction handling

### Requirement 9: API Design

**User Story:** As a frontend developer, I want a clean RESTful API, so that I can easily integrate the frontend with the backend.

#### Acceptance Criteria

1. WHEN a valid API request is received, THE Backend_System SHALL process the request and return the appropriate response
2. WHEN an invalid API request is received, THE Backend_System SHALL return an appropriate HTTP status code and error message
3. WHEN an error occurs during processing, THE Backend_System SHALL return a descriptive error message
4. THE Backend_System SHALL support CORS to allow cross-origin requests from the frontend

### Requirement 10: Architecture and Separation of Concerns

**User Story:** As a developer, I want the backend to follow a layered architecture, so that the codebase is maintainable and testable.

#### Acceptance Criteria

1. WHEN database operations are needed, THE Repository_Layer SHALL handle all SQL queries
2. WHEN business logic is needed, THE Service_Layer SHALL implement all validation and calculations
3. WHEN HTTP requests are received, THE Controller_Layer SHALL coordinate between routes and services
4. THE Backend_System SHALL separate data structures (models) from business logic (services)
5. THE Backend_System SHALL separate data access (repositories) from business logic (services)

### Requirement 11: Desktop Application Compatibility

**User Story:** As a product owner, I want the backend to be compatible with desktop application frameworks, so that the application can be deployed as a standalone desktop app.

#### Acceptance Criteria

1. THE Backend_System SHALL run as a localhost server without requiring external dependencies
2. THE Backend_System SHALL use SQLite as a local file-based database
3. THE Backend_System SHALL not depend on browser-specific APIs
4. WHEN deployed with Electron or Tauri, THE Backend_System SHALL function identically to the web version
