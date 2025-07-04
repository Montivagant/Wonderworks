import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ToyBrick,
  Sofa,
  Utensils,
  PawPrint,
  MonitorSmartphone,
  Paintbrush2
} from 'lucide-react';

const categories = [
  { href: '/products?cat=toys-games', label: 'Toys & Games', color: 'from-rose-500 to-pink-500', icon: ToyBrick },
  { href: '/products?cat=decor', label: 'Decor', color: 'from-amber-500 to-orange-500', icon: Paintbrush2 },
  { href: '/products?cat=home', label: 'Home', color: 'from-lime-500 to-emerald-500', icon: Sofa },
  { href: '/products?cat=kitchen', label: 'Kitchen', color: 'from-teal-500 to-cyan-500', icon: Utensils },
  { href: '/products?cat=pets', label: 'Pet Care', color: 'from-sky-500 to-indigo-500', icon: PawPrint },
  { href: '/products?cat=tech', label: 'Tech', color: 'from-violet-500 to-fuchsia-500', icon: MonitorSmartphone },
];

export default function CategoriesSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center text-4xl font-bold text-gray-900 mb-12"
        >
          Browse by Category
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
            >
              <Link href={cat.href} className={`group block rounded-3xl bg-gradient-to-br ${cat.color} p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-white/50`}>
                <cat.icon className="h-10 w-10 mx-auto mb-4 drop-shadow-md" />
                <span className="block text-center font-semibold tracking-wide">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 