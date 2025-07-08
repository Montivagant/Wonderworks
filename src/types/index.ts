/**
 * Shared type definitions for the WonderWorks application
 */

/**
 * Product interface representing a product in the store
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  images?: { id: number; url: string; position: number }[];
  categoryId?: number;
  category?: Category;
  rating: number;
  description?: string;
  inStock?: boolean;
  createdAt?: string;
  featured?: boolean;
  reviews?: Review[];
  isFlashDeal?: boolean;
  isRecommended?: boolean;
  flashDealEndTime?: string | null;
  originalPrice?: number | null;
  archived?: boolean;
}

/**
 * CartItem interface representing an item in the shopping cart
 */
export interface CartItem {
  productId: number;
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  inStock: boolean;
}

/**
 * Cart interface representing the shopping cart
 */
export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

/**
 * WishlistItem interface representing an item in the wishlist
 */
export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  category: string;
  rating: number;
  inStock: boolean;
  addedAt: string;
}

/**
 * Wishlist interface representing the user's wishlist
 */
export interface Wishlist {
  items: WishlistItem[];
  itemCount: number;
}

/**
 * OrderItem interface representing an item in an order
 */
export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  product?: Product;
}

/**
 * Order interface representing a customer order
 */
export interface Order {
  id: number;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date?: string;
  createdAt?: string;
  items: OrderItem[];
  shippingAddress?: string;
}

/**
 * Review interface representing a product review
 */
export interface Review {
  id: number;
  author: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

/**
 * Address interface representing a user's address
 */
export interface Address {
  id: number;
  type: 'HOME' | 'WORK' | 'OTHER';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User interface representing a user profile
 */
export interface User {
  id: number;
  email: string;
  name?: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt?: string;
}

/**
 * WishlistAnalytics interface for admin dashboard
 */
export interface WishlistAnalytics {
  totalWishlistItems: number;
  totalUsersWithWishlists: number;
  topWishlistedProducts: {
    productId: number;
    productName: string;
    wishlistCount: number;
  }[];
  wishlistActivityByUser: {
    userId: number;
    userEmail: string;
    userName?: string;
    wishlistItemCount: number;
    lastActivity: string;
  }[];
}

export interface Category {
  id: number;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
} 