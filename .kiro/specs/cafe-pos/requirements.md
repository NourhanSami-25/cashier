# Requirements Document

## Introduction

Cafe POS هو نظام كاشير مخصص للكافيهات والمطاعم الصغيرة، يعمل عبر الويب ويتيح إنشاء وإدارة الفواتير، إدارة المنتجات والتصنيفات، حساب الضريبة والخدمة تلقائيًا، وعرض تقارير المبيعات. النظام مصمم ليكون سريعًا وسهل الاستخدام مع إمكانية التحويل لاحقًا إلى تطبيق Desktop.

## Glossary

- **POS_System**: نظام نقطة البيع الرئيسي الذي يدير جميع عمليات الكاشير
- **Invoice**: الفاتورة التي تحتوي على المنتجات المباعة والحسابات
- **Invoice_Item**: عنصر واحد في الفاتورة يمثل منتج مع الكمية والسعر
- **Product**: منتج قابل للبيع في الكافيه
- **Category**: تصنيف يجمع المنتجات المتشابهة
- **Cart**: سلة المشتريات الحالية قبل إتمام الفاتورة
- **Subtotal**: المجموع الفرعي قبل الضريبة والخدمة
- **Service_Fee**: رسوم الخدمة المضافة للفاتورة
- **Tax**: الضريبة المضافة للفاتورة
- **Payment_Method**: طريقة الدفع (نقدي أو بطاقة)

## Requirements

### Requirement 1: Product Display and Selection

**User Story:** As a cashier, I want to view and select products quickly, so that I can create invoices efficiently during busy hours.

#### Acceptance Criteria

1. WHEN the Cashier_Page loads, THE POS_System SHALL display all available products in a grid layout
2. WHEN a user clicks on a Category tab, THE POS_System SHALL filter and display only products belonging to that Category
3. WHEN a user clicks on a Product card, THE POS_System SHALL add that Product to the current Cart
4. THE Product card SHALL display the product name and price clearly
5. WHEN a Product is added to Cart, THE POS_System SHALL provide visual feedback to confirm the addition

### Requirement 2: Cart Management

**User Story:** As a cashier, I want to manage items in the current invoice, so that I can adjust quantities and remove items as needed.

#### Acceptance Criteria

1. THE Cart SHALL display all added items with product name, unit price, quantity, and item total
2. WHEN a user clicks the increment button on a Cart_Item, THE POS_System SHALL increase the quantity by 1
3. WHEN a user clicks the decrement button on a Cart_Item, THE POS_System SHALL decrease the quantity by 1
4. WHEN the quantity of a Cart_Item reaches 0, THE POS_System SHALL remove that item from the Cart
5. WHEN a user clicks the delete button on a Cart_Item, THE POS_System SHALL remove that item from the Cart immediately
6. WHEN the Cart is modified, THE POS_System SHALL recalculate all totals automatically

### Requirement 3: Invoice Calculations

**User Story:** As a cashier, I want the system to calculate totals automatically, so that I avoid calculation errors.

#### Acceptance Criteria

1. THE POS_System SHALL calculate the Subtotal as the sum of all (unit_price × quantity) for each Cart_Item
2. THE POS_System SHALL calculate the Service_Fee as a configurable percentage of the Subtotal
3. THE POS_System SHALL calculate the Tax as a configurable percentage of the Subtotal
4. THE POS_System SHALL calculate the Total as Subtotal + Service_Fee + Tax
5. WHEN any Cart_Item is added, removed, or modified, THE POS_System SHALL recalculate all values within 100ms
6. THE POS_System SHALL display all monetary values with exactly 2 decimal places

### Requirement 4: Payment Processing

**User Story:** As a cashier, I want to complete sales with different payment methods, so that I can accommodate customer preferences.

#### Acceptance Criteria

1. THE POS_System SHALL provide payment method options: Cash and Card
2. WHEN a user selects a Payment_Method and clicks complete sale, THE POS_System SHALL mark the Invoice as paid
3. WHEN a sale is completed, THE POS_System SHALL save the Invoice with all details
4. WHEN a sale is completed, THE POS_System SHALL clear the Cart and prepare for a new invoice
5. IF a user attempts to complete a sale with an empty Cart, THEN THE POS_System SHALL display an error message and prevent the action

### Requirement 5: New Invoice Creation

**User Story:** As a cashier, I want to start a new invoice at any time, so that I can serve the next customer.

#### Acceptance Criteria

1. WHEN a user clicks the "New Invoice" button, THE POS_System SHALL clear the current Cart
2. WHEN a user clicks the "New Invoice" button with items in Cart, THE POS_System SHALL prompt for confirmation before clearing
3. WHEN a new invoice is started, THE POS_System SHALL reset all totals to zero

### Requirement 6: Product Management

**User Story:** As an admin, I want to manage products and categories, so that I can keep the menu up to date.

#### Acceptance Criteria

1. THE Products_Page SHALL display all products in a table with name, price, category, and action buttons
2. WHEN a user clicks "Add Product", THE POS_System SHALL display a form with fields for name, price, and category
3. WHEN a user submits a valid product form, THE POS_System SHALL save the product and update the product list
4. IF a user submits a product form with invalid data, THEN THE POS_System SHALL display validation errors
5. WHEN a user clicks "Edit" on a product, THE POS_System SHALL populate the form with existing product data
6. WHEN a user clicks "Delete" on a product, THE POS_System SHALL prompt for confirmation before deleting
7. THE POS_System SHALL allow adding and deleting categories

### Requirement 7: Sales Reports

**User Story:** As an admin, I want to view sales reports, so that I can track business performance.

#### Acceptance Criteria

1. THE Reports_Page SHALL display a date picker to select the report date
2. WHEN a date is selected, THE POS_System SHALL display summary cards showing: total sales amount, number of invoices, and total revenue
3. THE Reports_Page SHALL display a list of invoices for the selected date with invoice number, total, and payment method
4. WHEN no invoices exist for the selected date, THE POS_System SHALL display a "No data" message

### Requirement 8: Invoice Printing

**User Story:** As a cashier, I want to print invoices, so that I can provide receipts to customers.

#### Acceptance Criteria

1. WHEN a user clicks "Print Invoice", THE POS_System SHALL generate a printable version of the current or completed invoice
2. THE printed invoice SHALL include: invoice number, date/time, all items with quantities and prices, subtotal, service fee, tax, total, and payment method

### Requirement 9: Data Persistence

**User Story:** As a user, I want my data to be saved, so that I don't lose information when the system restarts.

#### Acceptance Criteria

1. THE POS_System SHALL persist all products to storage
2. THE POS_System SHALL persist all completed invoices to storage
3. THE POS_System SHALL persist all categories to storage
4. WHEN the application loads, THE POS_System SHALL restore all persisted data

### Requirement 10: User Interface Layout

**User Story:** As a user, I want a clear and organized interface, so that I can navigate the system easily.

#### Acceptance Criteria

1. THE POS_System SHALL display a header with the system name and navigation links
2. THE navigation SHALL include links to: Cashier, Products, and Reports pages
3. THE POS_System SHALL display notifications and messages in a designated area
4. THE Cashier_Page SHALL be divided into: product selection area (left) and cart/invoice area (right)
