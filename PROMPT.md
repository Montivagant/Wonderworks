# WonderWorks Project Context & Development Guide

**Last Updated:** January 2025  
**Current Status:** Tier 5 Complete - Advanced Features & Modern Design System  
**Current Version:** 0.1.3  
**Next Phase:** Tier 6 - Performance & Scale

## 🎯 Project Overview

WonderWorks is a modern e-commerce platform built with Next.js 15, TypeScript, Tailwind CSS, Prisma, and NextAuth. The project follows a tiered development approach and has undergone significant refactoring to establish a solid foundation for scalable e-commerce functionality with a modern orange/amber design system.

## 📋 Current Project State

### ✅ Completed Features (Tier 0-5)

#### Database & Authentication (Tier 0):
- **Prisma Schema**: Complete database with User, Product, Order, OrderItem, Wishlist, Address models
- **NextAuth Integration**: Credentials provider with OAuth support (Google)
- **User Management**: Registration and login functionality with email verification
- **Admin Protection**: Middleware protecting admin routes
- **Database Setup**: SQLite with proper migrations

#### Core Business Flows (Tier 1):
- **Login System**: Functional login page with session management
- **Header Integration**: Dynamic login/logout buttons based on session
- **Admin User**: Seeded admin user for testing
- **Session Management**: Client-side AuthProvider with SessionProvider

#### E-commerce Features (Tier 2):
- **Shopping Cart**: Persistent database-backed cart with API endpoints
- **Checkout Flow**: Address collection, order creation with Stripe payment integration
- **Order History**: View past orders and their status with detailed order pages
- **Payment Integration**: Stripe payment gateway with webhook handling
- **Order Notifications**: Email confirmations and status updates via Nodemailer

#### Enhanced Features (Tier 3):
- **Product Detail Pages**: Rich product information display
- **Image Carousel**: Multi-image galleries with smooth transitions
- **Product Recommendations**: Smart recommendation algorithm
- **Search & Filtering**: Advanced product search with filters
- **Category Browsing**: Category-based product organization
- **Featured Products Carousel**: Professional product showcase

#### Admin Enhancements (Tier 4):
- **Analytics Dashboard**: Real-time business metrics and insights
- **Order Management**: Complete order lifecycle management
- **User Management**: Customer and admin administration
- **Product Management**: Edit and manage product catalog
- **Role-based Access**: Secure admin-only functionality

#### Advanced Features & Design System (Tier 5):
- **Landing Page Redesign**: Complete overhaul with modern orange/amber theme
- **Animated Hero Section**: Dynamic gradient background with subtle animations
- **Categories Section**: Colorful gradient tiles with category icons
- **Benefits Section**: "Shop With Confidence" with 4 key benefits
- **Featured Products Grid**: Compact multi-product display
- **New Landing Page Sections**: Testimonials, How It Works, Newsletter, CTA
- **Complete Page Revamps**: Products, Orders, Wishlist, Footer with modern design
- **Wishlist System**: Complete wishlist functionality with database persistence
- **Profile Management**: User profile page with address CRUD operations
- **Admin Redirects**: Automatic redirect to /admin for admin users on login
- **Enhanced Security**: Route protection for /admin, /wishlist, and /profile
- **Wishlist Analytics**: Admin dashboard includes wishlist usage metrics
- **Performance Optimization**: Fixed LCP image priority warnings
- **Design System**: Orange/amber theme with perfect color contrast
- **Accessibility**: WCAG compliant design with proper contrast ratios
- **Modern UI/UX**: Framer Motion animations and smooth transitions

### 🎨 Design System Achievements

#### **Theme & Visual Design**
- **Orange/Amber Color Palette**: Consistent theme across all pages
- **Perfect Color Contrast**: WCAG compliant accessibility standards
- **Modern Typography**: Improved font weights and hierarchy
- **Gradient Backgrounds**: Subtle orange/amber gradients throughout
- **Status Color Coding**: Emerald, blue, purple for different states

#### **Landing Page Enhancements**
- **Hero Section**: Animated with dynamic gradient background
- **Categories Section**: Interactive gradient tiles with icons
- **Featured Products**: Compact multi-product grid display
- **Benefits Section**: "Shop With Confidence" with 4 key benefits
- **Testimonials Section**: Customer reviews with star ratings
- **How It Works Section**: Step-by-step shopping process guide
- **Newsletter Section**: Email subscription with modern design
- **CTA Section**: Final call-to-action before footer

#### **Page Revamps**
- **Products Page**: Advanced filtering, grid/list view modes, enhanced UX
- **Orders Page**: Status-based color coding, detailed order tracking
- **Wishlist Page**: Statistics dashboard, enhanced product cards
- **Footer**: Modern design with perfect color contrast and accessibility

### 🔧 Technical Infrastructure

#### Current Stack:
- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v3 with custom components
- **Database**: SQLite (development), PostgreSQL (production ready)
- **ORM**: Prisma with type-safe queries
- **Authentication**: NextAuth with credentials and OAuth providers
- **State Management**: React Context + SWR
- **Type Safety**: TypeScript throughout
- **Animations**: Framer Motion
- **Design System**: Orange/amber theme with perfect accessibility

#### Key Dependencies:
```json
{
  "next": "^15.3.4",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "prisma": "^5.0.0",
  "next-auth": "^4.24.0",
  "swr": "^2.2.0",
  "bcryptjs": "^2.4.3",
  "tailwindcss": "^3.4.0",
  "framer-motion": "^10.16.0",
  "stripe": "^14.0.0",
  "nodemailer": "^6.9.0"
}
```

## 🗄️ Database Schema

### Current Models:
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?
  name      String?
  role      UserRole @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
  wishlist  Wishlist[]
  addresses Address[]
  accounts  Account[]
  sessions  Session[]
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Float
  image       String?
  category    String
  stock       Int         @default(0)
  featured    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
  wishlist    Wishlist[]
  reviews     Review[]
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  status    OrderStatus @default(PENDING)
  total     Float
  items     OrderItem[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  order     Order  @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float
}

model Wishlist {
  id        String @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())
}

model Address {
  id          String @id @default(cuid())
  userId      String
  user        User   @relation(fields: [userId], references: [id])
  street      String
  city        String
  state       String
  postalCode  String
  country     String
  isDefault   Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Review {
  id        String @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id])
  userId    String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
}

// OAuth and Session Management
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model PasswordResetToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

enum UserRole {
  ADMIN
  CUSTOMER
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

## 🔐 Authentication System

### NextAuth Configuration:
- **Providers**: Credentials (email/password) + Google OAuth
- **Session Strategy**: JWT
- **Database**: Prisma adapter
- **Route Protection**: Middleware for admin routes
- **Email Verification**: Token-based email verification
- **Password Reset**: Self-service password reset flow

### Key Files:
- `src/lib/authOptions.ts`: NextAuth configuration
- `src/components/AuthProvider.tsx`: Session management wrapper
- `middleware.ts`: Route protection logic
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth API route
- `src/app/api/register/route.ts`: User registration endpoint
- `src/app/api/auth/verify/[token]/route.ts`: Email verification
- `src/app/api/auth/reset/request/route.ts`: Password reset request
- `src/app/api/auth/reset/[token]/route.ts`: Password reset

### Environment Variables Required:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
DATABASE_URL="file:./dev.db"

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📁 Project Structure

```
wonderworks/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin portal (protected)
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin API endpoints
│   │   │   ├── auth/          # Authentication & OAuth
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── orders/        # Order management
│   │   │   ├── payment/       # Stripe integration
│   │   │   ├── products/      # Product management
│   │   │   ├── profile/       # User profile management
│   │   │   ├── register/      # User registration
│   │   │   └── wishlist/      # Wishlist management
│   │   ├── cart/              # Shopping cart page
│   │   ├── checkout/          # Checkout process
│   │   ├── login/             # Authentication
│   │   ├── orders/            # Order history (revamped)
│   │   ├── product/           # Product details
│   │   ├── products/          # Product catalog (revamped)
│   │   ├── profile/           # User profile
│   │   ├── wishlist/          # Wishlist page (revamped)
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage (revamped)
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── OrderManagement.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── landing/           # Landing page components (revamped)
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CategoriesSection.tsx
│   │   │   ├── FeaturedProductsSection.tsx
│   │   │   ├── BenefitsSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── NewsletterSection.tsx
│   │   │   └── CTASection.tsx
│   │   ├── CategoryBubbles.tsx
│   │   ├── FeaturedProductsCarousel.tsx
│   │   ├── Footer.tsx         # Revamped with modern design
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProductCard.tsx    # Enhanced with view modes
│   │   ├── ReviewForm.tsx
│   │   ├── ReviewList.tsx
│   │   └── SearchAndFilter.tsx # Revamped with orange theme
│   ├── contexts/              # React contexts
│   │   ├── CartContext.tsx
│   │   └── WishlistContext.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── authOptions.ts
│   │   ├── email.ts
│   │   └── prisma.ts
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── prisma/                    # Database schema
├── public/                    # Static assets
├── tailwind.config.js         # Tailwind configuration
├── jest.config.js             # Jest configuration
├── next.config.ts             # Next.js configuration
└── package.json
```

## 🎨 Design System Specifications

### **Color Palette**
```css
/* Primary Colors */
--orange-500: #f97316;
--orange-600: #ea580c;
--amber-500: #f59e0b;
--amber-600: #d97706;

/* Status Colors */
--emerald-500: #10b981; /* Success */
--blue-500: #3b82f6;    /* Info */
--purple-500: #8b5cf6;  /* Processing */
--red-500: #ef4444;     /* Error */

/* Background Gradients */
--gradient-orange: linear-gradient(135deg, #f97316 0%, #f59e0b 100%);
--gradient-subtle: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
```

### **Component Patterns**
```tsx
// Button Pattern
<button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
  Button Text
</button>

// Card Pattern
<div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-100">
  {/* Card Content */}
</div>

// Status Badge Pattern
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
  Status Text
</span>
```

## 🚀 Development Guidelines

### **Code Quality Standards**
- **TypeScript**: All code must be properly typed
- **ESLint**: Follow linting rules strictly
- **Testing**: Write tests for new features
- **Error Handling**: Proper error handling required
- **Documentation**: Comment complex logic

### **Design System Compliance**
- **Orange/Amber Theme**: Follow consistent color palette
- **Perfect Contrast**: Maintain WCAG AA accessibility standards
- **Framer Motion**: Use for smooth animations and transitions
- **Responsive Design**: Mobile-first approach across all breakpoints
- **Loading States**: Implement proper loading and error states

### **Performance Guidelines**
- **Bundle Size**: Keep bundle sizes minimal
- **Database Queries**: Optimize database operations
- **Caching**: Use SWR for data caching
- **Images**: Optimize image loading
- **Rendering**: Minimize unnecessary re-renders
- **Core Web Vitals**: Ensure compliance with performance metrics

### **Security Guidelines**
- **Authentication**: Always check user authentication
- **Authorization**: Verify user permissions
- **Input Validation**: Validate all user inputs
- **API Security**: Protect API endpoints
- **Environment Variables**: Secure sensitive data
- **Route Protection**: Use middleware for sensitive routes

## 🧪 Testing Strategy

### **Test Structure**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- ProductCard.test.tsx
```

### **Test Files**
- `src/components/ProductCard.test.tsx` - Component testing
- Jest configuration in `jest.config.js`
- Test setup in `jest.setup.js`

## 📊 Current Status Summary

### **Version**: 0.1.3
### **Status**: Production Ready with Modern Design System
### **Completion**: Tier 5 Complete (100% of planned features)
### **Build Status**: ✅ Clean builds with no errors
### **Test Status**: ✅ All tests passing
### **Lint Status**: ✅ Clean with minimal warnings
### **Design System**: ✅ Orange/amber theme with perfect accessibility

### **Key Achievements**
- ✅ Complete e-commerce functionality
- ✅ Modern orange/amber design system
- ✅ Perfect accessibility compliance
- ✅ Enhanced user experience across all pages
- ✅ Professional landing page with multiple sections
- ✅ Advanced admin features with analytics
- ✅ Secure authentication and payment processing
- ✅ Clean codebase with TypeScript and testing

## 🎯 Next Development Phases

### **Tier 6: Performance & Scale** (Planned)
- Advanced caching strategies
- CDN integration
- Database optimization
- Load testing and scaling
- Monitoring and logging
- Performance optimization
- SEO improvements

### **Tier 7: Advanced E-commerce** (Planned)
- Subscription services
- Loyalty program
- Advanced payment methods
- Shipping integration
- Tax calculation
- International shipping
- Multi-language support

### **Tier 8: Mobile & Advanced Features** (Planned)
- Mobile app considerations
- Advanced search with AI
- Product recommendations engine
- Inventory management system
- Advanced reporting and analytics
- Social media integration

---

**WonderWorks** - Modern E-commerce for the Egyptian Market 🛍️✨

**Last Updated**: January 2025  
**Status**: Production Ready with Complete Design System ✅ 