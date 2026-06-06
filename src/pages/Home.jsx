import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Menu, Quote, Star, X, Zap } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Footer } from '../components/common/Footer';
import { ChatWidget } from '../components/common/ChatWidget';
import { useAuth } from '../context/AuthContext';

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      `We used to discard 30–40 meals every night. Now those meals reach families in need within the hour. This platform transformed how we think about surplus — it's no longer waste, it's impact.`,
    name: 'Chef Tariq Mehmood',
    org: 'Spice Garden Restaurant, Gulberg III',
    role: 'restaurant',
    emoji: '🍛',
    rating: 5,
  },
  {
    id: 2,
    quote:
      'The push notifications are a game-changer. Our volunteers get alerted the moment food is posted nearby, so we can plan the pickup without any calls or coordination. It saves us hours every week.',
    name: 'Sana Iqbal',
    org: 'Al-Khidmat Foundation, Lahore',
    role: 'ngo',
    emoji: '🤝',
    rating: 5,
  },
  {
    id: 3,
    quote:
      `Posting takes under a minute. We fill the form, hit submit, and within 20 minutes an NGO has accepted. Our kitchen staff actually feel proud now — they're feeding people, not a dumpster.`,
    name: 'Manager Bilal Shah',
    org: 'Lahori Darbar, Defence Road',
    role: 'restaurant',
    emoji: '🍲',
    rating: 5,
  },
];

const roleBadge = {
  restaurant: 'bg-brand-100 text-brand-700',
  ngo: 'bg-orange-100 text-orange-700',
};

export default function Home() {
  const { user, role } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Public navbar */}
      <header className="border-b border-gray-100 sticky top-0 z-30 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" onClick={() => setNavOpen(false)}><Logo stacked /></Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
              <a href="#for-restaurants" className="hover:text-gray-900 transition-colors">For Restaurants</a>
              <a href="#for-ngos" className="hover:text-gray-900 transition-colors">For NGOs</a>
              <a href="#impact" className="hover:text-gray-900 transition-colors">Impact</a>
              <a href="#testimonials" className="hover:text-gray-900 transition-colors">Stories</a>
            </nav>
            <div className="flex items-center gap-2">
              {user ? (
                <Link to={role === 'ngo' ? '/ngo' : role === 'admin' ? '/admin' : '/restaurant'} className="btn-primary text-sm">
                  Open dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost hidden sm:inline-flex">Login</Link>
                  <Link to="/register" className="btn-primary hidden sm:inline-flex">Get Started <ArrowRight size={16} /></Link>
                </>
              )}
              {!user && (
                <button
                  onClick={() => setNavOpen((o) => !o)}
                  className="md:hidden btn-ghost p-2"
                  aria-label="Toggle navigation"
                >
                  {navOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile nav drawer */}
          {navOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-slide-up">
              {[
                { href: '#how', label: 'How it works' },
                { href: '#for-restaurants', label: 'For Restaurants' },
                { href: '#for-ngos', label: 'For NGOs' },
                { href: '#impact', label: 'Impact' },
                { href: '#testimonials', label: 'Stories' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setNavOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 pt-2 px-1">
                <Link to="/login" onClick={() => setNavOpen(false)} className="flex-1 btn-secondary text-center">Login</Link>
                <Link to="/register" onClick={() => setNavOpen(false)} className="flex-1 btn-primary text-center">Get Started</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-brand-200 rounded-full px-3 py-1 text-xs font-semibold text-brand-700">
              🌱 Real-time food matching · Lahore
            </div>
            <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Reduce Food Waste,{' '}
              <span className="text-brand-600 block sm:inline">Feed the Hungry.</span>
            </h1>
            <p className="text-gray-600 mt-4 sm:mt-5 text-base lg:text-lg max-w-xl">
              Restaurants post surplus meals. Nearby NGOs get instant alerts and pick them up within hours — not days. Together we close the gap between waste and want.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-7">
              <Link to="/register?role=restaurant" className="btn-primary text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 justify-center">
                Register as Restaurant <ArrowRight size={16} />
              </Link>
              <Link to="/register?role=ngo" className="btn-ghost text-brand-700 hover:bg-brand-50 text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 justify-center">
                Register as NGO
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-xs text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-600" /> Free to use</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-600" /> Real-time alerts</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-brand-600" /> Verified NGOs</div>
            </div>
          </div>

          {/* Preview card */}
          <div className="relative mt-4 lg:mt-0">
            <div className="absolute -top-3 right-3 sm:right-auto sm:-right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1">
              <Zap size={12} /> LIVE
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">🍛</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">Spice Garden Restaurant</div>
                  <div className="text-xs text-gray-500">Gulberg III · 2.4 km</div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-semibold shrink-0">Available</span>
              </div>
              <div className="font-bold text-gray-900">Biryani &amp; Karahi</div>
              <div className="text-sm text-gray-600 mt-1">25 meals · ready for pickup</div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-orange-500 font-semibold flex items-center gap-1">
                  <Clock size={14} /> Pickup in 28 min
                </div>
                <button className="btn-primary text-sm" disabled>Accept</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="impact" className="bg-brand-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            ['12,840+', 'Meals Rescued'],
            ['95', 'Active Restaurants'],
            ['42', 'Partner NGOs'],
            ['<30 min', 'Avg Pickup Time'],
          ].map(([n, l]) => (
            <div key={l} className="py-2">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold">{n}</div>
              <div className="text-xs text-brand-100 mt-1 leading-tight">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-12 sm:py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">How it works</h2>
          <p className="text-center text-gray-500 mt-2 max-w-2xl mx-auto text-sm sm:text-base">Three steps. Meals rescued in hours, not days.</p>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
            {[
              { i: '1', t: 'Restaurant Posts', d: 'Fill in title, quantity, expiry and pickup location.' },
              { i: '2', t: 'Nearby NGOs Notified', d: 'Push alerts go to NGOs within radius — in real time.' },
              { i: '3', t: 'Accept & Collect', d: 'One-tap accept, then pickup. Status updates live.' },
            ].map((s) => (
              <div key={s.i} className="card p-5 sm:p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-lg">{s.i}</div>
                <div className="font-bold mt-3">{s.t}</div>
                <p className="text-sm text-gray-600 mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 sm:py-14 lg:py-20 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-white border border-brand-200 rounded-full px-3 py-1 text-xs font-semibold text-brand-700 mb-4">
              💬 Real stories from our community
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              What Our Community Says
            </h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-base">
              Restaurants and NGOs across Lahore are already making a difference — here&apos;s what they experience every day.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 flex flex-col"
              >
                {/* Top: icon + stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center text-xl shrink-0">
                    {t.emoji}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="relative flex-1">
                  <Quote
                    size={28}
                    className="absolute -top-1 -left-1 text-brand-100 fill-brand-100"
                  />
                  <p className="text-sm text-gray-600 leading-relaxed pl-5">
                    {t.quote}
                  </p>
                </div>

                {/* Author */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.org}</div>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${roleBadge[t.role]}`}
                  >
                    {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA under testimonials */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 mb-4">Join hundreds of restaurants and NGOs already making an impact.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register?role=restaurant" className="btn-primary px-6 py-2.5">
                Join as Restaurant <ArrowRight size={16} />
              </Link>
              <Link
                to="/register?role=ngo"
                className="btn-ghost text-brand-700 hover:bg-brand-100 border border-brand-200 px-6 py-2.5"
              >
                Join as NGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Audience CTAs */}
      <section className="py-12 sm:py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-4 sm:gap-6">
          <div id="for-restaurants" className="card p-6 sm:p-8">
            <div className="text-3xl">🍳</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">For Restaurants</h3>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Turn surplus into impact. Post in under 30 seconds — we&apos;ll handle alerting the right NGOs nearby.</p>
            <Link to="/register?role=restaurant" className="btn-primary mt-5 inline-flex">Get started <ArrowRight size={16} /></Link>
          </div>
          <div id="for-ngos" className="card p-6 sm:p-8">
            <div className="text-3xl">🤝</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">For NGOs</h3>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Get push alerts when food drops near you. Browse, accept, pickup — all from one dashboard.</p>
            <Link to="/register?role=ngo" className="btn-secondary border-2 border-brand-600 text-brand-700 mt-5 inline-flex">Join as NGO <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
}
