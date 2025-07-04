import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Ahmed',
    role: 'Home Decor Enthusiast',
    content: 'WonderWorks has transformed my living space! The quality of their products is exceptional, and the delivery was lightning fast.',
    rating: 5,
    avatar: '/placeholder.svg'
  },
  {
    name: 'Mohammed Hassan',
    role: 'Tech Professional',
    content: 'I love how easy it is to find exactly what I need. The search and filtering features are incredible, and the prices are unbeatable.',
    rating: 5,
    avatar: '/placeholder.svg'
  },
  {
    name: 'Fatima Ali',
    role: 'Interior Designer',
    content: 'As a professional designer, I appreciate the curated selection and premium quality. My clients always love the pieces I source from here.',
    rating: 5,
    avatar: '/placeholder.svg'
  },
  {
    name: 'Ahmed Mostafa',
    role: 'Pet Owner',
    content: 'The pet care section is amazing! My furry friends love their new beds and toys. Great quality and fast shipping.',
    rating: 5,
    avatar: '/placeholder.svg'
  },
  {
    name: 'Nour El-Din',
    role: 'Kitchen Enthusiast',
    content: 'Finally, a place where I can find all my kitchen essentials in one place! The quality is top-notch and prices are fair.',
    rating: 5,
    avatar: '/placeholder.svg'
  },
  {
    name: 'Layla Mahmoud',
    role: 'Gift Shopper',
    content: 'Perfect for finding unique gifts! The wishlist feature helps me keep track of items, and the checkout process is seamless.',
    rating: 5,
    avatar: '/placeholder.svg'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust WonderWorks for their lifestyle needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full">
                  <Quote className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">50K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">10K+</div>
            <div className="text-gray-600">Products</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">24h</div>
            <div className="text-gray-600">Fast Delivery</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 