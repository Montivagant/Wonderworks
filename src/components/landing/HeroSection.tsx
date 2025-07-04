import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white">
      {/* Decorative shapes */}
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-md"
        >
          Elevate Your Everyday Living
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-6 max-w-2xl text-xl sm:text-2xl text-white/90"
        >
          Hand-picked products that spark joy, boost productivity, and beautify your home.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-10 flex gap-4"
        >
          <Link
            href="/products"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition hover:scale-105 hover:bg-gray-50"
          >
            Shop Now
          </Link>
          <Link
            href="/about"
            className="rounded-xl border border-white/30 px-8 py-4 font-semibold text-white backdrop-blur-md transition hover:bg-white/10 hover:scale-105"
          >
            Learn More
          </Link>
        </motion.div>

        {/* Hero imagery */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {['/placeholder.svg','/placeholder.svg','/placeholder.svg','/placeholder.svg'].map((src,i)=>(
            <div key={i} className="relative h-40 w-40 overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <Image src={src} alt="Featured product" fill className="object-cover" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 