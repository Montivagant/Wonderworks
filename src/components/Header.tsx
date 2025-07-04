'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import {
  ShoppingCart,
  User,
  UserPlus,
  Menu,
  X,
  Home,
  Package,
  Info,
  Phone,
  ShoppingBag,
  Heart,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { data: session } = useSession();

  // Navigation items for desktop
  const getDesktopNavItems = () => {
    const baseItems = [
      { href: '/', label: 'Home', icon: Home },
      { href: '/products', label: 'Products', icon: Package },
      { href: '/orders', label: 'My Orders', icon: ShoppingBag },
    ];
    
    // Logged-in extras
    if (session) {
      baseItems.push({ href: '/wishlist', label: 'Wishlist', icon: Heart });

      // Admin dashboard link
      const role = (session.user as { role?: string })?.role;
      if (role === 'ADMIN') {
        baseItems.push({ href: '/admin', label: 'Dashboard', icon: LayoutDashboard });
      }
    }
    
    baseItems.push(
      { href: '/about', label: 'About', icon: Info },
      { href: '/contact', label: 'Contact', icon: Phone }
    );
    
    return baseItems;
  };

  // Navigation items for mobile
  const getMobileNavItems = () => {
    const baseItems = [
      { href: '/', label: 'Home', icon: Home },
      { href: '/products', label: 'Products', icon: Package },
      { href: '/orders', label: 'My Orders', icon: ShoppingBag },
    ];
    
    // Logged-in extras
    if (session) {
      baseItems.push({ href: '/wishlist', label: 'Wishlist', icon: Heart });

      // Admin dashboard link
      const role = (session.user as { role?: string })?.role;
      if (role === 'ADMIN') {
        baseItems.push({ href: '/admin', label: 'Dashboard', icon: LayoutDashboard });
      }
    }
    
    baseItems.push(
      { href: '/about', label: 'About', icon: Info },
      { href: '/contact', label: 'Contact', icon: Phone }
    );
    
    return baseItems;
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
              WonderWorks
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {getDesktopNavItems().map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={item.href} 
                  className="text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium relative group flex items-center space-x-1"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.href === '/wishlist' && wishlist.itemCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlist.itemCount > 9 ? '9+' : wishlist.itemCount}
                    </span>
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                href="/cart" 
                className="text-gray-700 hover:text-orange-600 transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  {cart.itemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      {cart.itemCount > 99 ? '99+' : cart.itemCount}
                    </motion.div>
                  )}
                </div>
                <span className="font-medium">Cart</span>
              </Link>
            </motion.div>
            
            {session ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link 
                    href="/profile" 
                    className="text-gray-700 hover:text-orange-600 transition-colors font-medium flex items-center space-x-1"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <button onClick={() => signOut()} className="text-gray-700 hover:text-gray-900">Logout</button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-orange-600 transition-colors font-medium flex items-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href="/register" 
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center space-x-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-600 focus:outline-none focus:text-orange-600 p-2 rounded-lg hover:bg-gray-50"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 bg-white/95 backdrop-blur-md">
                {getMobileNavItems().map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={item.href} 
                      className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium flex items-center space-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.href === '/wishlist' && wishlist.itemCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {wishlist.itemCount > 9 ? '9+' : wishlist.itemCount}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link 
                    href="/cart" 
                    className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <ShoppingCart className="w-5 h-5" />
                        {cart.itemCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                            {cart.itemCount > 99 ? '99+' : cart.itemCount}
                          </div>
                        )}
                      </div>
                      <span>Cart</span>
                    </div>
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {session ? (
                    <>
                      <Link 
                        href="/profile" 
                        className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium flex items-center space-x-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button 
                        onClick={() => signOut()} 
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link 
                      href="/login" 
                      className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium flex items-center space-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                  )}
                </motion.div>
                
                {!session && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link 
                      href="/register" 
                      className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-colors font-medium flex items-center space-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
} 