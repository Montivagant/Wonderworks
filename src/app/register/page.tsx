'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    // Simple email regex validation
    const emailRegex = /[^@]+@[^.]+\..+/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || 'Registration failed');
    } else {
      toast.success('Registered! Check your email to verify.');
      router.push('/login');
    }
  };

  // Themed hero section
  const Hero = () => (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white mb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -150 }}
        animate={{ opacity: 0.15, scale: 1, x: 0 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="absolute -top-32 -left-40 h-[28rem] w-[28rem] rounded-full bg-white blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 150 }}
        animate={{ opacity: 0.1, scale: 1, y: 0 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white blur-3xl"
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-md"
        >
          Create your WonderWorks account
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-6 max-w-2xl text-xl sm:text-2xl text-white/90"
        >
          Sign up to enjoy personalized shopping, wishlists, and more!
        </motion.p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex flex-col justify-center">
      <Hero />
      <div className="flex items-center justify-center px-4 pb-20">
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-orange-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-2xl font-semibold mb-6 text-center text-orange-700">Create your WonderWorks account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-orange-700">Name<span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-700">Email<span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-700">Password<span className="text-red-500">*</span></label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-700">Confirm Password<span className="text-red-500">*</span></label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 block w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-orange-600 hover:to-amber-600">
              {loading ? 'Creating…' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">Have an account? <Link href="/login" className="text-orange-600 hover:underline">Sign in</Link></p>
        </motion.div>
      </div>
      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white text-center mt-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold mb-6"
        >
          Already have an account?
        </motion.h2>
        <p className="mb-10 text-lg text-white/90 max-w-xl mx-auto">
          Sign in to access your account, track orders, and manage your wishlist.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition hover:scale-105 hover:bg-gray-50"
        >
          Sign In
        </Link>
      </section>
    </div>
  );
} 