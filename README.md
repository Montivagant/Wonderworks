# WonderWorks E-commerce Platform

A modern, full-featured B2C e-commerce platform built for the Egyptian market using Next.js 15, TypeScript, and modern web technologies.

## 🚀 **Status: Production Ready**

**Current Version**: 0.1.3  
**Build Status**: ✅ Clean builds with no errors  
**Test Status**: ✅ All tests passing  
**Lint Status**: ✅ Clean with minimal warnings  
**Theme**: 🎨 Modern Orange/Amber Design System  

## ✨ Features

### 🛍️ **Customer Features**
- **Authentication**: Secure user registration and login with email verification
- **Product Catalog**: Browse products with categories and advanced search
- **Advanced Search**: Real-time search with filters, sorting, and view modes
- **Shopping Cart**: Persistent cart with database storage
- **Wishlist**: Save products for later with persistent storage and analytics
- **Secure Checkout**: Stripe payment integration with webhook handling
- **Order Management**: Track orders and view detailed history
- **Product Reviews**: Rate and review products with star ratings
- **Email Notifications**: Order confirmations, verification, and password reset
- **Profile Management**: User profile with address management and preferences
- **Consistent Theming**: All major pages (Cart, Login, Signup, About, Contact) use a unified, animated, and accessible design system for a seamless user experience.

### 👨‍💼 **Admin Features**
- **Analytics Dashboard**: Real-time business metrics and insights
- **Order Management**: Complete order lifecycle management with status updates
- **User Management**: Customer and admin administration with role controls
- **Product Management**: Edit and manage product catalog with images
- **Role-based Access**: Secure admin-only functionality with middleware protection
- **Wishlist Analytics**: Track wishlist usage and customer preferences
- **Address Management**: View and manage customer addresses

### 🛠️ **Technical Features**
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance**: Optimized loading, rendering, and Core Web Vitals
- **Security**: Authentication, authorization, input validation, and route protection
- **Testing**: Jest test suite with React Testing Library
- **Real-time Updates**: SWR for data synchronization and caching
- **Modern UI/UX**: Orange/amber theme with Framer Motion animations

## 🎨 **Design System**

### **Theme & Colors**
- **Primary**: Orange/amber gradient system
- **Background**: Subtle orange/amber gradients
- **Accents**: Emerald, blue, and purple for status indicators
- **Typography**: Modern, readable fonts with perfect contrast
- **Animations**: Smooth Framer Motion transitions throughout

### **Landing Page Sections**
- **Hero Section**: Animated hero with dynamic gradient background
- **Categories Section**: Interactive category tiles with icons
- **Featured Products**: Compact multi-product grid display
- **Benefits Section**: "Shop With Confidence" with 4 key benefits
- **Testimonials Section**: Customer reviews with star ratings
- **How It Works**: Step-by-step shopping process guide
- **Newsletter Section**: Email subscription with modern design
- **CTA Section**: Final call-to-action before footer

### 🛒 Enhanced Pages
- **Products Page**: Advanced filtering, grid/list view modes, and improved UX
- **Orders Page**: Status-based color coding and detailed order tracking
- **Wishlist Page**: Statistics dashboard and enhanced product cards
- **Cart Page**: Themed, animated, and fully responsive with modern design
- **Login & Signup Pages**: Revamped with orange/amber theme, animated hero sections, and modern forms
- **Footer**: Modern design with perfect color contrast and accessibility

## 🏗️ Tech Stack

- **Frontend**: Next.js 15.3.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with OAuth support
- **Payments**: Stripe
- **Email**: Nodemailer
- **State Management**: React Context + SWR
- **Testing**: Jest + React Testing Library
- **Animations**: Framer Motion
- **UI Components**: Custom components with modern design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested with Node.js 23.7.0)
- npm 10+
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd wonderworks

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma db push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth (Google)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 📁 Project Structure

```
wonderworks/
├── src/
│   ├── app/                    # Next.js App Router
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
│   │   ├── admin/             # Admin pages
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
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── prisma/                    # Database schema
├── public/                    # Static assets
├── tailwind.config.js         # Tailwind configuration
├── jest.config.js             # Jest configuration
├── next.config.ts             # Next.js configuration
└── package.json
```

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm test             # Run tests
npx tsc --noEmit     # Type checking

# Database
npx prisma studio    # Open database GUI
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
npm run db:seed      # Seed database
```

### Development Guidelines
- **TypeScript**: All code must be properly typed
- **ESLint**: Follow linting rules strictly
- **Testing**: Write tests for new features
- **Error Handling**: Proper error handling required
- **Documentation**: Comment complex logic
- **Design System**: Follow orange/amber theme consistently
- **Accessibility**: Ensure perfect color contrast and keyboard navigation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup
- Set up production database (PostgreSQL recommended)
- Configure environment variables for production
- Set up Stripe webhooks for payment processing
- Configure email service for notifications
- Set up OAuth providers for authentication

## 📊 Performance

### Core Web Vitals
- **LCP**: Optimized with proper image loading
- **FID**: Smooth interactions with optimized JavaScript
- **CLS**: Stable layout with proper image dimensions

### Optimization Features
- **Image Optimization**: Next.js Image component with proper sizing
- **Code Splitting**: Automatic code splitting with Next.js
- **Caching**: SWR for efficient data caching
- **Bundle Optimization**: Tree shaking and minification

## 🔒 Security

### Authentication & Authorization
- **NextAuth.js**: Secure authentication with multiple providers
- **Route Protection**: Middleware-based route protection
- **Role-based Access**: Admin-only functionality protection
- **Input Validation**: Server-side validation for all inputs

### Payment Security
- **Stripe Integration**: PCI-compliant payment processing
- **Webhook Verification**: Secure webhook handling
- **Token-based Security**: Secure password reset and verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the design system
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the changelog for recent updates
- Open an issue for bugs or feature requests
- Contact the development team

---

**WonderWorks** - Modern E-commerce for the Egyptian Market 🛍️✨
