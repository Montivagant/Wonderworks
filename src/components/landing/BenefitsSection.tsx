import { motion } from 'framer-motion';
import { Truck, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';

const benefits = [
 {
   icon: Truck,
   title: 'Fast & Free Delivery',
   desc: 'Get items delivered across Egypt within 48 hours—free on orders over 500 EGP.',
   color: 'bg-orange-100 text-orange-600'
 },
 {
   icon: ShieldCheck,
   title: 'Premium Quality',
   desc: 'We hand-pick suppliers and inspect every product to guarantee satisfaction.',
   color: 'bg-lime-100 text-lime-600'
 },
 {
   icon: CreditCard,
   title: 'Secure Payments',
   desc: 'Stripe-powered checkout with 3-D Secure and PCI-compliant encryption.',
   color: 'bg-cyan-100 text-cyan-600'
 },
 {
   icon: RefreshCw,
   title: '30-Day Returns',
   desc: 'Changed your mind? Hassle-free returns and instant refunds.',
   color: 'bg-rose-100 text-rose-600'
 }
];

export default function BenefitsSection() {
 return (
   <section className="bg-white py-24">
     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
       <motion.h2
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         transition={{ duration: 0.7 }}
         className="text-center text-4xl font-bold text-gray-900 mb-14"
       >
         Shop With Confidence
       </motion.h2>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
         {benefits.map((b, i) => (
           <motion.div
             key={b.title}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: i * 0.1 }}
             className="text-center"
           >
             <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${b.color}`}> 
               <b.icon className="h-8 w-8" />
             </div>
             <h3 className="mb-2 text-xl font-semibold text-gray-900">{b.title}</h3>
             <p className="text-gray-600 leading-relaxed text-sm">{b.desc}</p>
           </motion.div>
         ))}
       </div>
     </div>
   </section>
 );
} 