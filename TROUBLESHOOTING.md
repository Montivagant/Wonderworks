# WonderWorks Troubleshooting Guide

## 🚀 Current Status: Production Ready - Version 0.2.1

This guide provides solutions for common issues encountered during development, deployment, and maintenance of the WonderWorks e-commerce platform.

## 📋 Table of Contents

1. [Quick Start Issues](#quick-start-issues)
2. [Development Environment](#development-environment)
3. [Database Issues](#database-issues)
4. [Authentication Problems](#authentication-problems)
5. [Build and Deployment](#build-and-deployment)
6. [Performance Issues](#performance-issues)
7. [Component and UI Issues](#component-and-ui-issues)
8. [UI Kit Issues](#ui-kit-issues)
9. [Admin Dashboard Issues](#admin-dashboard-issues)
10. [API and Backend Issues](#api-and-backend-issues)
11. [Testing Issues](#testing-issues)
12. [Common Error Messages](#common-error-messages)

## 🚀 Quick Start Issues

### **"npm not recognized" Error**

**Problem**: Node.js or npm not found in system PATH.

**Solutions**:
1. **Use Full Path**:
   ```bash
   # Windows
   C:\Program Files\nodejs\npm.cmd install
   
   # Or use npx with full path
   C:\Program Files\nodejs\npx.cmd prisma generate
   ```

2. **Add to System PATH**:
   - Open System Properties → Environment Variables
   - Add `C:\Program Files\nodejs\` to PATH
   - Restart terminal/command prompt

3. **Verify Installation**:
   ```bash
   node --version
   npm --version
   ```

### **Project Directory Confusion**

**Problem**: Running commands from wrong directory.

**Solution**: Always run commands from `D:\wonderworks\wonderworks`:
```bash
cd D:\wonderworks\wonderworks
npm install
npm run dev
```

### **Port Already in Use**

**Problem**: Port 3000 is already occupied.

**Solutions**:
1. **Kill existing process**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Or use different port
   npm run dev -- -p 3001
   ```

2. **Use different port**:
   ```bash
   PORT=3001 npm run dev
   ```

## 🛠️ Development Environment

### **Node.js Version Issues**

**Problem**: Incompatible Node.js version.

**Solution**: Use Node.js 18+:
```bash
node --version  # Should be 18.x or higher
```

**Installation**:
- Download from [nodejs.org](https://nodejs.org/)
- Use Node Version Manager (nvm) for multiple versions

### **Package Installation Issues**

**Problem**: npm install fails or packages missing.

**Solutions**:
1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use specific npm version**:
   ```bash
   npm install -g npm@latest
   ```

3. **Check package.json integrity**:
   ```bash
   npm audit fix
   ```

### **TypeScript Configuration Issues**

**Problem**: TypeScript errors or configuration problems.

**Solutions**:
1. **Regenerate TypeScript config**:
   ```bash
   npx tsc --init
   ```

2. **Check tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "target": "ES2020",
       "lib": ["dom", "dom.iterable", "es6"],
       "allowJs": true,
       "skipLibCheck": true,
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true,
       "forceConsistentCasingInFileNames": true,
       "noEmit": true,
       "incremental": true,
       "plugins": [
         {
           "name": "next"
         }
       ],
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
     "exclude": ["node_modules"]
   }
   ```

## 🗄️ Database Issues

### **Prisma Client Generation**

**Problem**: Prisma client not generated or outdated.

**Solutions**:
1. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

2. **Reset database**:
   ```bash
   npx prisma db push --force-reset
   npx prisma db seed
   ```

3. **Check Prisma schema**:
   ```bash
   npx prisma validate
   ```

### **Database Connection Issues**

**Problem**: Cannot connect to database.

**Solutions**:
1. **Check DATABASE_URL in .env**:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

2. **Verify database file exists**:
   ```bash
   ls prisma/dev.db
   ```

3. **Reset database**:
   ```bash
   npx prisma db push --force-reset
   npx prisma db seed
   ```

### **Migration Issues**

**Problem**: Database migrations fail.

**Solutions**:
1. **Reset and recreate**:
   ```bash
   npx prisma migrate reset
   npx prisma db push
   npx prisma db seed
   ```

2. **Check migration history**:
   ```bash
   npx prisma migrate status
   ```

3. **Force push schema**:
   ```bash
   npx prisma db push --force-reset
   ```

## 🔐 Authentication Problems

### **NextAuth Configuration Issues**

**Problem**: Authentication not working properly.

**Solutions**:
1. **Check environment variables**:
   ```env
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Verify authOptions configuration**:
   ```typescript
   // lib/authOptions.ts
   export const authOptions: NextAuthOptions = {
     providers: [
       CredentialsProvider({
         // ... configuration
       })
     ],
     session: {
       strategy: "jwt"
     },
     callbacks: {
       // ... callbacks
     }
   };
   ```

3. **Check session in components**:
   ```typescript
   import { useSession } from 'next-auth/react';
   
   const { data: session, status } = useSession();
   ```

### **Admin Access Issues**

**Problem**: Cannot access admin dashboard.

**Solutions**:
1. **Check user role in database**:
   ```sql
   SELECT email, role FROM User WHERE email = 'admin@admin.com';
   ```

2. **Verify admin route protection**:
   ```typescript
   // middleware.ts
   export function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;
     
     if (pathname.startsWith('/admin')) {
       const session = await getToken({ req: request });
       if (!session || session.role !== 'ADMIN') {
         return NextResponse.redirect(new URL('/login', request.url));
       }
     }
   }
   ```

## 🚀 Build and Deployment

### **Build Failures**

**Problem**: `npm run build` fails.

**Solutions**:
1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Check TypeScript errors**:
   ```bash
   npx tsc --noEmit
   ```

3. **Update dependencies**:
   ```bash
   npm update
   npm run build
   ```

### **Production Environment**

**Problem**: Issues in production environment.

**Solutions**:
1. **Set production environment variables**:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="production_secret"
   NEXTAUTH_URL="https://yourdomain.com"
   ```

2. **Generate Prisma client for production**:
   ```bash
   npx prisma generate
   ```

3. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```

## ⚡ Performance Issues

### **Slow Loading Times**

**Problem**: Application loads slowly.

**Solutions**:
1. **Optimize images**:
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/product.jpg"
     alt="Product"
     width={300}
     height={200}
     priority={true}
   />
   ```

2. **Implement code splitting**:
   ```typescript
   import dynamic from 'next/dynamic';
   
   const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
     loading: () => <div>Loading...</div>
   });
   ```

3. **Optimize component rendering**:
   ```typescript
   import React, { memo } from 'react';
   
   const ProductCard = memo(({ product }) => {
     return <div>{product.name}</div>;
   });
   ```

### **Memory Leaks**

**Problem**: Application memory usage increases over time.

**Solutions**:
1. **Clean up event listeners**:
   ```typescript
   useEffect(() => {
     const handleScroll = () => setIsScrolled(window.scrollY > 0);
     window.addEventListener('scroll', handleScroll);
     return () => window.removeEventListener('scroll', handleScroll);
   }, []);
   ```

2. **Optimize SWR usage**:
   ```typescript
   const { data, error } = useSWR('/api/data', fetcher, {
     revalidateOnFocus: false,
     dedupingInterval: 60000
   });
   ```

## 🧩 Component and UI Issues

### **Styling Problems**

**Problem**: Components not styled correctly.

**Solutions**:
1. **Check Tailwind CSS configuration**:
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: [
       './src/**/*.{js,ts,jsx,tsx}',
     ],
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#fff7ed',
             // ... other shades
           }
         }
       }
     }
   };
   ```

2. **Verify class names**:
   ```typescript
   // ✅ Correct
   className="bg-primary-600 text-white"
   
   // ❌ Incorrect
   className="bg-blue-600 text-white"
   ```

3. **Check component imports**:
   ```typescript
   // ✅ Correct
   import Button from '@/components/ui/Button';
   
   // ❌ Incorrect
   import Button from './Button';
   ```

### **Responsive Design Issues**

**Problem**: Components not responsive on mobile.

**Solutions**:
1. **Use responsive classes**:
   ```typescript
   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
   ```

2. **Test on different screen sizes**:
   - Use browser dev tools
   - Test on actual devices
   - Use responsive design tools

## 🎨 UI Kit Issues

### **Button Component Problems**

**Problem**: Button component not working correctly.

**Solutions**:
1. **Check variant usage**:
   ```typescript
   // ✅ Correct
   <Button variant="primary" size="md">Click me</Button>
   
   // ❌ Incorrect
   <Button variant="blue" size="large">Click me</Button>
   ```

2. **Verify loading state**:
   ```typescript
   <Button loading={true} disabled={true}>
     Loading...
   </Button>
   ```

3. **Check event handlers**:
   ```typescript
   <Button onClick={() => handleClick()} disabled={isLoading}>
     Submit
   </Button>
   ```

### **Card Component Issues**

**Problem**: Card component not displaying correctly.

**Solutions**:
1. **Use proper structure**:
   ```typescript
   import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
   
   <Card variant="elevated" hover={true}>
     <CardHeader>
       <h3>Title</h3>
     </CardHeader>
     <CardContent>
       <p>Content</p>
     </CardContent>
     <CardFooter>
       <Button>Action</Button>
     </CardFooter>
   </Card>
   ```

2. **Check variant props**:
   ```typescript
   // Available variants: 'default', 'elevated', 'outlined'
   <Card variant="elevated">
   ```

### **Badge Component Problems**

**Problem**: Badge component not showing correct colors.

**Solutions**:
1. **Use semantic variants**:
   ```typescript
   // ✅ Correct
   <Badge variant="success">Success</Badge>
   <Badge variant="warning">Warning</Badge>
   <Badge variant="error">Error</Badge>
   
   // ❌ Incorrect
   <Badge variant="green">Success</Badge>
   ```

2. **Check size props**:
   ```typescript
   // Available sizes: 'sm', 'md', 'lg'
   <Badge size="sm">Small</Badge>
   ```

## 🔧 Admin Dashboard Issues

### **AdminHeader Component**

**Problem**: AdminHeader not displaying correctly.

**Solutions**:
1. **Check props**:
   ```typescript
   <AdminHeader 
     userName="Admin User"
     userRole="Administrator"
     notifications={3}
   />
   ```

2. **Verify search functionality**:
   ```typescript
   // Search input should be connected to backend
   const handleSearch = (query: string) => {
     // Implement search logic
   };
   ```

3. **Check notification badge**:
   ```typescript
   // Notifications should be a number
   notifications={0} // No notifications
   notifications={5} // 5 notifications
   ```

### **AdminNavigation Component**

**Problem**: Navigation tabs not working.

**Solutions**:
1. **Check activeTab prop**:
   ```typescript
   const [activeTab, setActiveTab] = useState('dashboard');
   
   <AdminNavigation
     activeTab={activeTab}
     onTabChange={(tab) => setActiveTab(tab)}
   />
   ```

2. **Verify tab IDs**:
   ```typescript
   // Available tab IDs: 'dashboard', 'categories', 'products', 'orders', 'users'
   type TabId = 'dashboard' | 'categories' | 'products' | 'orders' | 'users';
   ```

3. **Check icon imports**:
   ```typescript
   import { 
     BarChart3, 
     FolderOpen, 
     Package, 
     ShoppingCart, 
     Users 
   } from 'lucide-react';
   ```

### **AdminLayout Component**

**Problem**: Layout not wrapping content correctly.

**Solutions**:
1. **Use proper structure**:
   ```typescript
   <AdminLayout>
     <AdminHeader />
     <AdminNavigation />
     <div>Content here</div>
   </AdminLayout>
   ```

2. **Check responsive design**:
   ```typescript
   // Layout should be responsive
   className="min-h-screen bg-neutral-50 font-sans"
   ```

### **Analytics Dashboard Issues**

**Problem**: Analytics data not loading.

**Solutions**:
1. **Check API endpoint**:
   ```typescript
   const { data: analytics, error } = useSWR('/api/admin/analytics', fetcher);
   ```

2. **Verify data structure**:
   ```typescript
   interface AnalyticsData {
     revenue: { total: number; monthly: number };
     orders: { total: number; monthly: number };
     products: { total: number; lowStock: number };
     users: { total: number };
   }
   ```

3. **Check error handling**:
   ```typescript
   if (error) {
     return <div>Error loading analytics</div>;
   }
   
   if (!analytics) {
     return <div>Loading...</div>;
   }
   ```

## 🌐 API and Backend Issues

### **API Route Problems**

**Problem**: API routes not working.

**Solutions**:
1. **Check route structure**:
   ```
   src/app/api/admin/analytics/route.ts
   ```

2. **Verify HTTP methods**:
   ```typescript
   export async function GET(request: Request) {
     // GET logic
   }
   
   export async function POST(request: Request) {
     // POST logic
   }
   ```

3. **Check authentication**:
   ```typescript
   const session = await getServerSession(authOptions);
   if (!session || session.user.role !== 'ADMIN') {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

### **Database Query Issues**

**Problem**: Database queries failing.

**Solutions**:
1. **Check Prisma client**:
   ```typescript
   import { prisma } from '@/lib/prisma';
   ```

2. **Verify schema**:
   ```bash
   npx prisma validate
   ```

3. **Use transactions for complex queries**:
   ```typescript
   const result = await prisma.$transaction([
     prisma.order.aggregate({ _sum: { total: true } }),
     prisma.product.count(),
     prisma.user.count()
   ]);
   ```

## 🧪 Testing Issues

### **Component Testing Problems**

**Problem**: Component tests failing.

**Solutions**:
1. **Setup test environment**:
   ```typescript
   // jest.setup.js
   import '@testing-library/jest-dom';
   ```

2. **Mock dependencies**:
   ```typescript
   jest.mock('next-auth/react', () => ({
     useSession: () => ({ data: null, status: 'unauthenticated' })
   }));
   ```

3. **Test UI kit components**:
   ```typescript
   import { render, screen } from '@testing-library/react';
   import Button from '@/components/ui/Button';
   
   test('renders button with correct text', () => {
     render(<Button>Click me</Button>);
     expect(screen.getByText('Click me')).toBeInTheDocument();
   });
   ```

### **Integration Testing Issues**

**Problem**: Integration tests not working.

**Solutions**:
1. **Setup test database**:
   ```typescript
   // Use test database for integration tests
   process.env.DATABASE_URL = "file:./test.db";
   ```

2. **Mock external APIs**:
   ```typescript
   jest.mock('@/lib/prisma', () => ({
     prisma: {
       user: { findMany: jest.fn() },
       product: { findMany: jest.fn() }
     }
   }));
   ```

## ❌ Common Error Messages

### **TypeScript Errors**

**Error**: `Property 'X' does not exist on type 'Y'`

**Solution**:
```typescript
// Define proper interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}
```

### **Prisma Errors**

**Error**: `PrismaClientKnownRequestError`

**Solution**:
```typescript
try {
  await prisma.user.create({ data: userData });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
  }
}
```

### **Next.js Errors**

**Error**: `Module not found`

**Solution**:
```typescript
// Use proper import paths
import Button from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';
```

### **Tailwind CSS Errors**

**Error**: `Class 'X' not found`

**Solution**:
```javascript
// Check tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // ...
};
```

## 🔧 Performance Optimization

### **Component Optimization**

**Problem**: Components re-rendering unnecessarily.

**Solutions**:
1. **Use React.memo**:
   ```typescript
   const ProductCard = React.memo(({ product }) => {
     return <div>{product.name}</div>;
   });
   ```

2. **Use useMemo for expensive calculations**:
   ```typescript
   const totalRevenue = useMemo(() => {
     return orders.reduce((sum, order) => sum + order.total, 0);
   }, [orders]);
   ```

3. **Use useCallback for event handlers**:
   ```typescript
   const handleClick = useCallback(() => {
     // Handle click
   }, []);
   ```

### **Bundle Size Optimization**

**Problem**: Large bundle size.

**Solutions**:
1. **Code splitting**:
   ```typescript
   const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'));
   ```

2. **Tree shaking**:
   ```typescript
   // Import only what you need
   import { BarChart3 } from 'lucide-react';
   ```

3. **Optimize images**:
   ```typescript
   import Image from 'next/image';
   <Image src="/image.jpg" alt="Alt" width={300} height={200} />
   ```

## 📞 Getting Help

### **Debugging Steps**

1. **Check browser console** for JavaScript errors
2. **Check network tab** for API failures
3. **Check terminal** for build errors
4. **Check database** for data issues
5. **Check environment variables** for configuration

### **Useful Commands**

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Database
npx prisma studio
npx prisma generate
npx prisma db push

# Type checking
npx tsc --noEmit
```

### **Resources**

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Comprehensive development guide
- **[PLAN.md](./PLAN.md)** - Project roadmap and specifications
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes
- **GitHub Issues** - Report bugs and request features

---

**Last Updated**: December 19, 2024  
**Current Version**: 0.2.1  
**Status**: Production Ready with Modern Admin Dashboard & UI Kit 

## Password Hashing & Security
- All user passwords are always hashed automatically via Prisma middleware, even if created/edited in Prisma Studio or scripts. No plain text passwords are ever stored.
- If you see 'Invalid password' errors, ensure the password was entered correctly; the system will always hash it if needed.

## Authentication Error Messages
- All authentication errors are now unified and user-friendly (e.g., 'Invalid password', 'No user found with this email', 'Email not verified').

## Analytics & Counters
- All counters and analytics exclude archived/out-of-stock products for accuracy.

## Directory Usage
- Always run scripts and commands from `D:\wonderworks\wonderworks`. 