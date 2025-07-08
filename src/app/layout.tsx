import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import CategoryBar from '@/components/layout/CategoryBar';
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "WonderWorks - Premium Products for Every Home",
  description: "Discover amazing toys, decor, household items, pet care, office equipment, and accessories at WonderWorks. Quality products for every need.",
  keywords: "toys, games, decor, household, pet care, office equipment, accessories, e-commerce",
  // Add About page metadata
  openGraph: {
    title: "About WonderWorks | Modern E-commerce for Egypt",
    description: "Learn about WonderWorks, our mission, features, and design system. Built for Egypt with modern tech and beautiful design.",
    url: "/about",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
        <WishlistProvider>
        <CartProvider>
          <div className="min-h-screen bg-white flex flex-col">
            <SiteHeader />
            <CategoryBar />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--neutral-800)',
                color: 'var(--neutral-50)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: 'var(--success-500)',
                  secondary: 'var(--neutral-50)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--error-500)',
                  secondary: 'var(--neutral-50)',
                },
              },
            }}
          />
        </CartProvider>
        </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
