'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white">
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
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-md"
          >
            About WonderWorks
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-6 max-w-2xl text-xl sm:text-2xl text-white/90"
          >
            A modern, full-featured e-commerce platform built for the Egyptian market, blending cutting-edge technology with beautiful, accessible design.
          </motion.p>
        </div>
      </section>

      {/* Project Overview */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-bold text-orange-600 mb-8 text-center"
          >
            Our Mission
          </motion.h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
            WonderWorks empowers customers across Egypt to discover, shop, and enjoy premium products with confidence. We combine a seamless shopping experience, robust security, and a vibrant design system to deliver joy and value to every home.
          </p>
        </div>
      </section>

      {/* Features Summary */}
      <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold text-gray-900 mb-12 text-center"
          >
            What Makes Us Different
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: '/globe.svg',
                title: 'Built for Egypt',
                desc: 'Localized experience, fast delivery, and tailored payment options.'
              },
              {
                icon: '/window.svg',
                title: 'Modern Tech',
                desc: 'Next.js 15, TypeScript, Tailwind, Stripe, and more.'
              },
              {
                icon: '/vercel.svg',
                title: 'Performance',
                desc: 'Optimized for speed, accessibility, and Core Web Vitals.'
              },
              {
                icon: '/placeholder.svg',
                title: 'Design System',
                desc: 'Orange/amber theme, perfect contrast, and smooth animations.'
              }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Image src={f.icon} alt={f.title} width={40} height={40} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-orange-700">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Design System Highlights */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold text-orange-600 mb-8 text-center"
          >
            Our Design System
          </motion.h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-lg text-gray-700 max-w-3xl mx-auto">
            <li><span className="font-semibold text-orange-500">Orange/Amber Theme:</span> Consistent, vibrant, and accessible color palette.</li>
            <li><span className="font-semibold text-orange-500">Accessibility:</span> WCAG AA compliance, perfect color contrast, keyboard navigation.</li>
            <li><span className="font-semibold text-orange-500">Modern Typography:</span> Readable, elegant, and responsive fonts.</li>
            <li><span className="font-semibold text-orange-500">Smooth Animations:</span> Framer Motion transitions and interactive feedback.</li>
            <li><span className="font-semibold text-orange-500">Component Library:</span> 30+ reusable, modular components.</li>
            <li><span className="font-semibold text-orange-500">Mobile-First:</span> Fully responsive layouts for all devices.</li>
          </ul>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold mb-6"
        >
          Ready to Experience WonderWorks?
        </motion.h2>
        <p className="mb-10 text-lg text-white/90 max-w-xl mx-auto">
          Discover premium products, seamless shopping, and a vibrant community. Join us today!
        </p>
        <Link
          href="/products"
          className="inline-block rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition hover:scale-105 hover:bg-gray-50"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
} 