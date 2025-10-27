# Order Management System - Setup Guide

## Overview
This is a full-featured e-commerce order management system with role-based access control, inventory management, payment processing, and comprehensive reporting.

## Features

### Admin Roles
1. **Master Admin** (Full Access)
   - Complete business overview and analytics
   - Product management (CRUD operations)
   - Order management (all orders)
   - Expense tracking
   - Sales and supplier reports
   - Ability to mark items as ready for payment

2. **Second Admin** (Warehouse/Shipping Only)
   - Can only view fully paid orders ready to ship
   - Mark orders as shipped (Lalamove or Shopee)
   - No access to financials or business overview

3. **Customer**
   - Browse products by category
   - Add items to cart
   - Place orders with deposit/full payment
   - Track order status

### Product Categories
- **Pasabuy Items**: Pre-order items arriving in ~30 days (require 30% deposit)
- **On-hand Items**: Ready to ship immediately (require full payment)
- **Sale/Clearance**: Discounted items ready to ship

### Order Flow
1. Customer adds items to cart
2. Checkout with customer details
3. For Pasabuy items: 30% deposit required within 24 hours
4. If deposit not paid: Order auto-cancelled, stock returned
5. Admin marks items as "Ready for Payment" when arrived
6. Customer pays remaining balance
7. Order marked as "Fully Paid"
8. Warehouse staff ships order (visible to Second Admin)

### Payment Options
- GCash
- Bank Transfer
- Credit Card

### Shipping Options
- Lalamove delivery
- Shopee checkout delivery

### Financial Features
- Expense tracking with categories
- Sales reports by month
- Expenses by category
- Top selling products
- Supplier order report with profit margins
- Gross and net profit calculations

## Default Credentials

The system automatically creates these accounts on first run:

- **Master Admin**
  - Email: admin@shop.com
  - Password: admin123

- **Warehouse Staff (Second Admin)**
  - Email: warehouse@shop.com
  - Password: warehouse123

Customers can sign up for their own accounts.

## Getting Started

1. Open the application
2. The system will automatically initialize with default admin accounts
3. Login with one of the admin accounts above
4. Add products via the Products tab
5. Create a customer account to test the ordering flow

## Important Notes

- This is a prototype application meant for demonstration
- Passwords are stored in plain text (use proper hashing in production)
- The 24-hour deposit deadline is checked when orders are fetched
- All data is stored in the Supabase KV store
- The system uses polling for real-time updates (30-second intervals)

## Usage Tips

### For Master Admin:
1. Start by adding products in different categories
2. Monitor the Overview dashboard for business metrics
3. Mark pending orders as "Ready for Payment" when items arrive
4. Track expenses to see accurate profit margins
5. Use Reports tab for detailed analytics

### For Warehouse Staff:
1. Focus on the orders list
2. Only fully paid orders will be visible
3. Mark orders as shipped with appropriate courier

### For Customers:
1. Browse products by category tabs
2. Note the deposit requirement for Pasabuy items
3. Pay deposit within 24 hours or order will cancel
4. Track orders in "My Orders" tab
5. Complete payment when items are ready

## Technical Stack

- Frontend: React + TypeScript
- UI: Tailwind CSS + shadcn/ui components
- Charts: Recharts
- Backend: Hono (Deno) on Supabase Edge Functions
- Database: Supabase KV Store
- Authentication: Custom auth with localStorage sessions
