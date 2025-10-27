# E-commerce Website with Admin Roles 👔

A full-featured e-commerce order management system with role-based access control, inventory management, payment processing, and comprehensive reporting.

🌐 **Live Demo**: [View on Vercel](https://your-project.vercel.app)

📐 **Original Design**: [Figma File](https://www.figma.com/design/rTmA9EsOwGk9pU14UXlPVw/E-commerce-Website-with-Admin-Roles)

---

## ✨ Features

### 🛍️ Customer Portal
- Browse products by category (Baby Boys, Baby Girls, New Arrivals, Best Sellers)
- Add to cart with quantity management
- Secure checkout with multiple payment options
- Order tracking and history
- Responsive mobile-first design

### 👨‍💼 Admin Roles

**Master Admin** (Full Access)
- Complete business dashboard with analytics
- Product management (CRUD operations)
- Order management and status tracking
- Expense tracking with categories
- Sales reports and supplier analytics
- Profit margin calculations

**Second Admin** (Warehouse/Shipping)
- View fully paid orders ready to ship
- Mark orders as shipped (Lalamove/Shopee)
- Streamlined shipping workflow

### 💰 Business Logic
- **Pasabuy Items**: Pre-order with 30% deposit requirement
- **On-Hand Items**: Full payment required
- **Sale/Clearance**: Discounted items
- Auto-cancellation of unpaid deposits after 24 hours
- Stock management and tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

---

## 📦 Deployment

This project is configured for **Vercel** deployment.

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect Vite and configure the build

**Environment Variables** (if needed):
- Currently uses Supabase KV Store backend
- Backend is already deployed on Supabase Functions

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🔐 Default Credentials

The system auto-creates these accounts on first run:

| Role | Email | Password |
|------|-------|----------|
| Master Admin | `admin@shop.com` | `admin123` |
| Warehouse Staff | `warehouse@shop.com` | `warehouse123` |
| Customer | `customer@shop.com` | `customer123` |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **UI Framework**: Tailwind CSS v4
- **Component Library**: shadcn/ui (Radix UI)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Backend**: Hono (Deno) on Supabase Edge Functions
- **Database**: Supabase KV Store
- **Authentication**: Custom auth with localStorage

---

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/           # Admin dashboard modules
│   ├── customer/         # Customer view components
│   ├── ui/              # Reusable UI components
│   └── ...
├── supabase/
│   └── functions/       # Backend API (Hono)
└── utils/
    └── supabase/         # Supabase configuration
```

---

## 🎨 Design

- **Theme**: Pink/Peach with Poppins typography
- **Design System**: shadcn/ui components
- **Responsive**: Mobile-first approach
- **Animations**: Smooth transitions and glassmorphism effects

---

## 📱 Mobile Responsive

The application is fully responsive with:
- Mobile-optimized headers
- Hidden user details on small screens
- Touch-friendly interactions
- Adaptive layouts

---

## 🔄 Development

```bash
# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📄 License

This project is private and proprietary.

---

## 👥 Contributing

This is a private project. For questions or support, please contact the development team.

---

**Made with ❤️ using React, TypeScript, and Vercel**