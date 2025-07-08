import Link from 'next/link';
import { Badge } from '@/components/ui';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-16 font-sans" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="text-lg font-semibold text-white">WonderWorks</Link>
          <p className="mt-3 text-sm text-neutral-400">Modern marketplace for everyday essentials.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white font-medium">About</Link></li>
            <li><Link href="/contact" className="hover:text-white font-medium">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Customer Care</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/help" className="hover:text-white font-medium">Help Center</Link></li>
            <li><Link href="/returns" className="hover:text-white font-medium">Returns</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Trust</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="success" size="sm">Secure payments</Badge>
            <Badge variant="primary" size="sm">Fast delivery</Badge>
            <Badge variant="warning" size="sm">24/7 support</Badge>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">© {year} WonderWorks. All rights reserved.</div>
    </footer>
  );
} 