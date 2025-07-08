import { Shield, Truck, RotateCcw, Headphones } from 'lucide-react';

const trustFeatures = [
  {
    icon: Shield,
    title: 'Secure Shopping',
    description: 'SSL encrypted payments'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free shipping on orders $50+'
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day return policy'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Live chat & phone support'
  }
];

export default function TrustStrip() {
  return (
    <section className="bg-white border-t border-neutral-200 py-6 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{feature.title}</h3>
                <p className="text-xs text-neutral-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 