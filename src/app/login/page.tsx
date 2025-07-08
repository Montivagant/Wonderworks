'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

// Themed hero section component
function Hero() {
  return (
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
          Sign in to WonderWorks
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-6 max-w-2xl text-xl sm:text-2xl text-white/90"
        >
          Access your account and enjoy a seamless shopping experience.
        </motion.p>
      </div>
    </section>
  );
}

export default function LoginPage() {

  const { data: session } = useSession();
  const router = useRouter();
  
  let callbackUrl = '/';
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    callbackUrl = params.get('callbackUrl') || '/';
  }
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  // Add state for error message
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState('');

  // Redirect if already logged in
  if (session) {
    const userRole = (session.user as { role?: string })?.role;
    if (userRole === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push(callbackUrl);
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === 'register') {
      if (password !== confirm) {
        setLoading(false);
        setError('Passwords do not match');
        return;
      }
    }
    if (mode === 'login') {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      setLoading(false);
      if (res?.error) {
        if (res.error === 'No user found with this email') {
          setMode('register');
          toast('No account found. Please enter your name to create an account.');
          setTimeout(() => nameInputRef.current?.focus(), 100);
        } else {
          setError(res.error);
        }
      } else {
        toast.success('Signed in');
        if (res?.url && res.url.includes('admin')) {
          window.location.href = '/admin';
        } else {
          window.location.href = res?.url || '/';
        }
      }
    } else {
      // Register mode
      try {
        const registerRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await registerRes.json();
        setLoading(false);
        if (!registerRes.ok) {
          setError(data.error || 'Registration failed');
        } else {
          toast.success('Account created! Please check your email to verify.');
          const loginRes = await signIn('credentials', {
            email,
            password,
            redirect: false,
            callbackUrl,
          });
          if (loginRes?.error) {
            setError(loginRes.error);
          } else {
            window.location.href = loginRes?.url || '/';
          }
        }
      } catch (err) {
        setLoading(false);
        setError('Registration error');
      }
    }
  };

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
          <h1 className="text-2xl font-semibold mb-6 text-center text-orange-700">Sign in to WonderWorks</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-orange-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  ref={nameInputRef}
                  className="mt-1 block w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-orange-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={emailInputRef}
                className="mt-1 block w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                required
              />
              {mode === 'register' && (
                <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters.</p>
              )}
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-orange-700">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 block w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
                  required
                />
              </div>
            )}
            {error && (
              <div className="mb-4 text-center text-red-600 text-sm font-medium">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-orange-600 hover:to-amber-600"
            >
              {loading ? (mode === 'register' ? 'Creating…' : 'Signing in…') : (mode === 'register' ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          <div className="mt-6 flex flex-col gap-3 items-center justify-center">
            <button onClick={() => signIn('google')} className="flex items-center gap-2 border border-orange-200 rounded-lg px-4 py-2 hover:bg-orange-50 transition-all text-gray-800 font-medium w-full justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C33.3 2.5 28.9 0 24 0 14.6 0 6.4 5.9 2.7 14.4l7 5.4C11.6 14.3 17.3 9.5 24 9.5z"/><path fill="#34A853" d="M46.5 24.5c0-1.6-.1-2.9-.4-4.3H24v8h12.8c-.6 3.4-2.7 6.3-5.7 8.2l7 5.4c4.2-4 6.5-10 6.5-17.3z"/><path fill="#4A90E2" d="M7.2 28.8c-.4-1.2-.6-2.4-.6-3.8s.2-2.6.6-3.8L.2 15.8C-.8 18.3-1.5 21 1.7 24.9c.9 2.5 2.3 4.7 4 6.6l7-5.4c-.3-.4-.5-.7-.5-1.3z"/><path fill="#FBBC05" d="M24 48c6.5 0 12-2.1 16.2-5.8l-7-5.4c-2.1 1.4-4.8 2.6-9.2 2.6-6.7 0-12.4-4.8-14.4-11.2l-7 5.4C6.4 42 14.6 48 24 48z"/></svg>
              Continue with Google
            </button>
            <button onClick={() => signIn('facebook')} className="flex items-center gap-2 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition-all text-gray-800 font-medium w-full justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5"><path fill="#1877F3" d="M32 16c0-8.837-7.163-16-16-16S0 7.163 0 16c0 7.84 5.657 14.307 13.063 15.742V20.438h-3.938v-4.438h3.938v-3.383c0-3.89 2.312-6.063 5.857-6.063 1.699 0 3.477.305 3.477.305v3.813h-1.96c-1.928 0-2.53 1.197-2.53 2.426v2.902h4.297l-.687 4.438h-3.61v11.304C26.343 30.307 32 23.84 32 16z"/></svg>
              Continue with Facebook
            </button>
          </div>
          <div className="my-6 text-center text-sm text-gray-700">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-orange-600 hover:underline font-semibold focus:outline-none"
                  onClick={() => {
                    setMode('register');
                    setTimeout(() => nameInputRef.current?.focus(), 100);
                  }}
                >
                  Signup now!
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-orange-600 hover:underline font-semibold focus:outline-none"
                  onClick={() => {
                    setMode('login');
                    setTimeout(() => emailInputRef.current?.focus(), 100);
                  }}
                >
                  Log-in now!
                </button>
              </>
            )}
          </div>
          <p className="mt-2 text-center text-sm text-gray-700">
            <Link href="/forgot-password" className="text-orange-600 hover:underline">Forgot password?</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
} 