'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ContactPage() {
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
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-6 max-w-2xl text-xl sm:text-2xl text-white/90"
          >
            Have a question, feedback, or need support? We're here to help you get the most out of WonderWorks.
          </motion.p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-3xl font-bold text-orange-600 mb-6"
            >
              Get in Touch
            </motion.h2>
            <ul className="space-y-4 text-lg text-gray-700">
              <li>
                <span className="font-semibold text-orange-500">Email:</span> support@wonderworks.com
              </li>
              <li>
                <span className="font-semibold text-orange-500">Phone:</span> +20 123 456 7890
              </li>
              <li>
                <span className="font-semibold text-orange-500">Address:</span> 123 Nile Street, Cairo, Egypt
              </li>
              <li>
                <span className="font-semibold text-orange-500">Business Hours:</span> 9:00 AM – 6:00 PM (Sun–Thu)
              </li>
            </ul>
          </div>

          {/* Contact Form */}
          <form className="bg-orange-50 rounded-2xl shadow-lg p-8 flex flex-col gap-6">
            <h3 className="text-xl font-semibold text-orange-700 mb-2">Send Us a Message</h3>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="rounded-lg border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="rounded-lg border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              className="rounded-lg border border-orange-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-orange-600 hover:to-amber-600"
            >
              Send Message
            </button>
          </form>
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
          Want to Explore Our Products?
        </motion.h2>
        <p className="mb-10 text-lg text-white/90 max-w-xl mx-auto">
          Discover premium products, seamless shopping, and a vibrant community. Shop with WonderWorks today!
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