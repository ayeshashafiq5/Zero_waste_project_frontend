import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';

const LINKS = {
  restaurants: [
    { label: 'Post Food Surplus', to: '/register?role=restaurant' },
    { label: 'Restaurant Dashboard', to: '/restaurant' },
    { label: 'My Listings', to: '/restaurant/listings' },
    { label: 'Post History', to: '/restaurant/history' },
  ],
  ngos: [
    { label: 'Browse Available Food', to: '/register?role=ngo' },
    { label: 'NGO Dashboard', to: '/ngo' },
    { label: 'Accepted Requests', to: '/ngo/accepted' },
    { label: 'Enable Notifications', to: '/ngo' },
  ],
  platform: [
    { label: 'How It Works', href: '#how' },
    { label: 'Impact & Stats', href: '#impact' },
    { label: 'For Restaurants', href: '#for-restaurants' },
    { label: 'For NGOs', href: '#for-ngos' },
  ],
};

export const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    {/* Main grid */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="brightness-0 invert opacity-90">
            <Logo />
          </div>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
            Bridging the gap between surplus food and hungry communities in real time. Every meal rescued is a step toward a zero-waste Lahore.
          </p>
          <div className="flex items-center gap-2 mt-5 text-xs text-brand-400 font-medium">
            <Heart size={13} className="text-red-400 fill-red-400 shrink-0" />
            Made with purpose · Lahore, Pakistan
          </div>

          {/* University badge */}
          <div className="mt-5 inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
            <span className="text-base">🎓</span>
            <div>
              <div className="text-xs font-semibold text-gray-200">FYP — BSSE 8th Sem</div>
              <div className="text-[11px] text-gray-500 leading-tight">Minhaj University Lahore</div>
            </div>
          </div>
        </div>

        {/* For Restaurants */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            For Restaurants
          </h4>
          <ul className="space-y-2.5">
            {LINKS.restaurants.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For NGOs */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            For NGOs
          </h4>
          <ul className="space-y-2.5">
            {LINKS.ngos.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Get in Touch
          </h4>
          <ul className="space-y-3">
            <li>
              <a
                href="mailto:support@zerowastefood.app"
                className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-brand-400 transition-colors"
              >
                <Mail size={15} className="mt-0.5 shrink-0" />
                support@zerowastefood.app
              </a>
            </li>
            <li>
              <span className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                Lahore, Punjab, Pakistan
              </span>
            </li>
            <li>
              <a
                href="tel:+924235761000"
                className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-brand-400 transition-colors"
              >
                <Phone size={15} className="mt-0.5 shrink-0" />
                +92 42 3576 1000
              </a>
            </li>
          </ul>

          {/* Quick platform links */}
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mt-7 mb-4">
            Platform
          </h4>
          <ul className="space-y-2.5">
            {LINKS.platform.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* Divider + bottom bar */}
    <div className="border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div>
          © {new Date().getFullYear()} Zero-Waste Food Connect · All rights reserved.
        </div>
        <div className="flex items-center flex-wrap justify-center gap-x-5 gap-y-1">
          <span className="text-gray-600">Ayesha Shafiq &amp; Amna Kashif · Supervisor: Sir Mubeen Mathar</span>
          <a
            href="mailto:support@zerowastefood.app"
            className="hover:text-brand-400 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  </footer>
);
