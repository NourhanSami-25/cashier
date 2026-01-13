# Implementation Plan: Cafe POS

## Overview

خطة تنفيذ نظام Cafe POS تتبع نهجًا تدريجيًا، بدءًا من البنية الأساسية والخدمات، ثم المكونات، وأخيرًا التكامل. كل مهمة تبني على المهام السابقة لضمان عدم وجود كود معزول.

## Tasks

- [x] 1. Set up project foundation and types
  - [x] 1.1 Create TypeScript type definitions for all data models
    - Create `src/types/pos.ts` with interfaces for Product, Category, CartItem, Invoice, InvoiceItem, PaymentMethod, DailyReport, ValidationResult, and POSConfig
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 1.2 Create configuration constants
    - Create `src/config/pos.config.ts` with default service fee percentage (10%), tax percentage (14%), and currency (EGP)
    - _Requirements: 3.2, 3.3_

- [x] 2. Implement core calculation services
  - [x] 2.1 Implement InvoiceService with calculation logic
    - Create `src/services/invoiceService.ts`
    - Implement `calculateSubtotal(items)`: sum of (unitPrice × quantity)
    - Implement `calculateServiceFee(subtotal)`: subtotal × serviceFeePercentage
    - Implement `calculateTax(subtotal)`: subtotal × taxPercentage
    - Implement `calculateTotal(subtotal, serviceFee, tax)`: sum of all
    - Implement `formatCurrency(amount)`: format with 2 decimal places
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  - [x] 2.2 Write property test for invoice calculations
    - **Property 5: Invoice Calculation Correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  - [x] 2.3 Write property test for monetary formatting
    - **Property 6: Monetary Value Formatting**
    - **Validates: Requirements 3.6**

- [x] 3. Implement storage service
  - [x] 3.1 Implement StorageService for localStorage operations
    - Create `src/services/storageService.ts`
    - Implement `save<T>(key, data)`: serialize and save to localStorage
    - Implement `load<T>(key)`: load and deserialize from localStorage
    - Implement `remove(key)`: remove from localStorage
    - Handle errors gracefully with fallback to in-memory storage
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 3.2 Write property test for storage round-trip
    - **Property 11: Data Persistence Round-Trip**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [x] 4. Implement product service
  - [x] 4.1 Implement ProductService for product management
    - Create `src/services/productService.ts`
    - Implement `getAllProducts()`: retrieve all products from storage
    - Implement `getProductsByCategory(categoryId)`: filter products by category
    - Implement `addProduct(product)`: validate and save new product
    - Implement `updateProduct(id, product)`: update existing product
    - Implement `deleteProduct(id)`: remove product from storage
    - Implement `validateProduct(product)`: validate product fields
    - _Requirements: 6.1, 6.3, 6.4, 6.7_
  - [x] 4.2 Write property test for category filtering
    - **Property 1: Category Filtering Correctness**
    - **Validates: Requirements 1.2**
  - [x] 4.3 Write property test for product validation
    - **Property 9: Product Validation**
    - **Validates: Requirements 6.4**

- [x] 5. Implement cart state management
  - [x] 5.1 Create Cart Context and Provider
    - Create `src/context/CartContext.tsx`
    - Implement state for cart items, subtotal, serviceFee, tax, total
    - Implement `addItem(product)`: add product to cart or increment quantity
    - Implement `removeItem(itemId)`: remove item from cart
    - Implement `updateQuantity(itemId, delta)`: increment/decrement quantity
    - Implement `clearCart()`: reset cart to empty state
    - Auto-recalculate totals on any cart modification
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.1, 5.3_
  - [x] 5.2 Write property test for cart modification invariants
    - **Property 4: Cart Modification Invariants**
    - **Validates: Requirements 2.2, 2.3, 2.5, 2.6**
  - [x] 5.3 Write property test for new invoice state reset
    - **Property 8: New Invoice State Reset**
    - **Validates: Requirements 5.1, 5.3**

- [x] 6. Checkpoint - Core services complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement sale completion flow
  - [x] 7.1 Extend InvoiceService with sale completion
    - Add `createInvoice(items, paymentMethod)`: create invoice from cart items
    - Add `saveInvoice(invoice)`: persist invoice to storage
    - Add `generateInvoiceNumber()`: generate unique invoice number
    - _Requirements: 4.2, 4.3, 4.4_
  - [x] 7.2 Integrate sale completion in CartContext
    - Add `completeSale(paymentMethod)`: create invoice, save, clear cart
    - Validate cart is not empty before completing
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 7.3 Write property test for sale completion invariants
    - **Property 7: Sale Completion Invariants**
    - **Validates: Requirements 4.2, 4.3, 4.4**

- [x] 8. Implement report service
  - [x] 8.1 Implement ReportService for sales reports
    - Create `src/services/reportService.ts`
    - Implement `getInvoicesByDate(date)`: filter invoices by date
    - Implement `getDailyReport(date)`: generate daily summary
    - Implement `getTotalSales(date)`: sum of invoice totals
    - Implement `getInvoiceCount(date)`: count of invoices
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 8.2 Write property test for report data accuracy
    - **Property 10: Report Data Accuracy**
    - **Validates: Requirements 7.2, 7.3**

- [x] 9. Implement UI components for Cashier page
  - [x] 9.1 Update CategoryTabs component
    - Update `src/components/pos/CategoryTabs.tsx`
    - Display all categories as tabs
    - Add "All" tab for showing all products
    - Handle category selection and emit change event
    - _Requirements: 1.2_
  - [x] 9.2 Update ProductCard component
    - Update `src/components/pos/ProductCard.tsx`
    - Display product name and price
    - Handle click to add product to cart
    - _Requirements: 1.3, 1.4_
  - [x] 9.3 Write property test for product addition to cart
    - **Property 2: Product Addition to Cart**
    - **Validates: Requirements 1.3**
  - [x] 9.4 Update ProductGrid component
    - Update `src/components/pos/ProductGrid.tsx`
    - Display products in grid layout
    - Filter by selected category
    - _Requirements: 1.1, 1.2_
  - [x] 9.5 Update CartItem component
    - Update `src/components/pos/CartItem.tsx`
    - Display product name, unit price, quantity, item total
    - Add increment/decrement buttons
    - Add delete button
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  - [x] 9.6 Write property test for cart item display completeness
    - **Property 3: Cart Item Display Completeness**
    - **Validates: Requirements 2.1**
  - [x] 9.7 Update Cart component
    - Update `src/components/pos/Cart.tsx`
    - Display all cart items
    - Display subtotal, service fee, tax, total
    - Add payment method selection (Cash/Card)
    - Add "Complete Sale" button
    - Add "New Invoice" button
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1_

- [x] 10. Checkpoint - Cashier UI complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Update CashierPage with full functionality
  - [x] 11.1 Integrate all components in CashierPage
    - Update `src/pages/CashierPage.tsx`
    - Add CartContext provider
    - Wire CategoryTabs, ProductGrid, and Cart components
    - Handle category filtering
    - Handle product selection
    - Handle cart operations
    - Handle sale completion
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 4.1, 4.2, 5.1, 10.4_

- [x] 12. Implement Products management page
  - [x] 12.1 Create ProductForm component
    - Create `src/components/products/ProductForm.tsx`
    - Form fields: name, price, category dropdown
    - Validation and error display
    - Submit and cancel buttons
    - _Requirements: 6.2, 6.4_
  - [x] 12.2 Create ProductTable component
    - Create `src/components/products/ProductTable.tsx`
    - Display products in table format
    - Edit and Delete action buttons
    - _Requirements: 6.1_
  - [x] 12.3 Create CategoryManager component
    - Create `src/components/products/CategoryManager.tsx`
    - Add new category input
    - List existing categories with delete option
    - _Requirements: 6.7_
  - [x] 12.4 Update ProductsPage with full functionality
    - Update `src/pages/ProductsPage.tsx`
    - Integrate ProductTable, ProductForm, CategoryManager
    - Handle CRUD operations
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 6.7_

- [x] 13. Implement Reports page
  - [x] 13.1 Create DatePicker component
    - Create `src/components/reports/DatePicker.tsx`
    - Date selection input
    - _Requirements: 7.1_
  - [x] 13.2 Create SummaryCards component
    - Create `src/components/reports/SummaryCards.tsx`
    - Display total sales, invoice count, total revenue
    - _Requirements: 7.2_
  - [x] 13.3 Create InvoiceList component
    - Create `src/components/reports/InvoiceList.tsx`
    - Display invoices with number, total, payment method
    - Handle empty state
    - _Requirements: 7.3, 7.4_
  - [x] 13.4 Update ReportsPage with full functionality
    - Update `src/pages/ReportsPage.tsx`
    - Integrate DatePicker, SummaryCards, InvoiceList
    - Fetch and display report data
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 14. Implement print functionality
  - [x] 14.1 Create PrintableInvoice component
    - Create `src/components/print/PrintableInvoice.tsx`
    - Invoice layout for printing
    - Include all required fields
    - _Requirements: 8.1, 8.2_
  - [x] 14.2 Implement print service
    - Create `src/services/printService.ts`
    - Implement `printInvoice(invoice)`: trigger browser print
    - _Requirements: 8.1_

- [x] 15. Update Header and Navigation
  - [x] 15.1 Update Header component
    - Update `src/components/pos/Header.tsx`
    - Display system name "Cafe POS"
    - Navigation links: Cashier, Products, Reports
    - _Requirements: 10.1, 10.2_

- [x] 16. Final integration and testing
  - [x] 16.1 Wire up App with routing and providers
    - Update `src/App.tsx`
    - Add React Router for navigation
    - Wrap with necessary context providers
    - Add toast notifications
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 16.2 Write integration tests for full sale flow
    - Test: Add products → Modify cart → Complete sale → Verify invoice saved
    - _Requirements: 1.3, 2.2, 4.2, 4.3_
  - [x] 16.3 Write integration tests for product management
    - Test: Add product → Edit → Delete → Verify changes
    - _Requirements: 6.3, 6.5, 6.6_

- [x] 17. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are implemented
  - Test full application flow manually

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with React and fast-check for property testing
