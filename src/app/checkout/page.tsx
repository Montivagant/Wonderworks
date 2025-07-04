'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Payment Form Component
function PaymentForm({ 
  total, 
  address, 
  onSuccess 
}: { 
  total: number; 
  address: string; 
  onSuccess: () => void; 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Create order first
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const { id: orderId } = await orderRes.json();

      // Create payment intent
      const paymentRes = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, orderId }),
      });

      if (!paymentRes.ok) throw new Error('Payment setup failed');
      // Payment intent created successfully

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}`,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
          loading || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        }`}
      >
        {loading ? 'Processing Payment...' : `Pay ${total.toFixed(2)} EGP`}
      </button>
    </form>
  );
}

// Main Checkout Component
export default function CheckoutPage() {
  const { cart, clearCartItems } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (session?.user === undefined) return; // Still loading
    if (!session?.user) {
      router.replace('/login');
    }
  }, [session, router]);

  if (cart.itemCount === 0) {
    if (typeof window !== 'undefined') router.replace('/cart');
    return null;
  }

  const subtotal = cart.total;
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleAddressChange = async (newAddress: string) => {
    setAddress(newAddress);
    
    if (newAddress.trim()) {
      setLoading(true);
      try {
        // Create payment intent when address is provided
        const res = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ total })
        });
        
        if (res.ok) {
          // Payment intent created successfully
          console.log('Payment intent created');
        }
      } catch (error) {
        console.error('Failed to create payment intent:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePaymentSuccess = async () => {
    await clearCartItems();
    toast.success('Order placed successfully!');
    router.push('/orders');
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <textarea
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Street, City, Governorate, Postal Code"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>{tax.toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `${shipping.toFixed(2)} EGP`}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{total.toFixed(2)} EGP</span>
              </div>
            </div>

            {/* Payment Section */}
            {address.trim() ? (
              <Elements stripe={stripePromise}>
                <PaymentForm 
                  total={total} 
                  address={address} 
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Please enter your shipping address to proceed with payment
                </p>
                {loading && (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                )}
              </div>
            )}

            <Link href="/cart" className="block text-center mt-4 text-blue-600 hover:underline">
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 