import { motion } from 'framer-motion';
import { Search, ShoppingCart, CreditCard, Package } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse & Discover',
    description: 'Explore our curated collection of premium products across all categories. Use our advanced search and filtering to find exactly what you need.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ShoppingCart,
    title: 'Add to Cart',
    description: 'Build your perfect order by adding items to your cart. Save products to your wishlist for later or add them directly to your cart.',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: CreditCard,
    title: 'Secure Checkout',
    description: 'Complete your purchase with our secure Stripe-powered checkout. Multiple payment options available with instant confirmation.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Package,
    title: 'Fast Delivery',
    description: 'Get your items delivered across Egypt within 48 hours. Free delivery on orders over 500 EGP with real-time tracking.',
    color: 'from-purple-500 to-pink-500'
  }
];

export default function HowItWorksSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your journey from discovery to delivery in four simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              {/* Step Number */}
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 mb-4">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 transform translate-x-4">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 origin-left"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of customers who have already discovered the WonderWorks difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Browse Products
              </a>
              <a
                href="/register"
                className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-orange-500 transition-all duration-300"
              >
                Create Account
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 