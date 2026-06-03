import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { NotificationDropdown } from './NotificationDropdown';

const linksFor = (role) => {
  if (role === 'restaurant') {
    return [
      { to: '/restaurant', label: 'Dashboard', end: true },
      { to: '/restaurant/post', label: 'Post Food' },
      { to: '/restaurant/listings', label: 'My Listings' },
      { to: '/restaurant/ratings', label: 'Ratings' },
      { to: '/restaurant/profile', label: 'Settings' },
    ];
  }
  if (role === 'ngo') {
    return [
      { to: '/ngo', label: 'Dashboard', end: true },
      { to: '/ngo/browse', label: 'Browse Food' },
      { to: '/ngo/accepted', label: 'Accepted' },
      { to: '/ngo/profile', label: 'Settings' },
    ];
  }
  if (role === 'admin') {
    return [
      { to: '/admin', label: 'Moderation', end: true },
      { to: '/admin/analytics', label: 'Analytics' },
    ];
  }
  return [];
};

const ROLE_CHIP = {
  restaurant: 'bg-brand-100 text-brand-700',
  ngo: 'bg-orange-100 text-orange-700',
  admin: 'bg-purple-100 text-purple-700',
};

const AVATAR_BG = {
  restaurant: 'bg-orange-500',
  ngo: 'bg-emerald-500',
  admin: 'bg-purple-500',
};

export const Navbar = () => {
  const { user, profile, role, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = linksFor(role);

  const initials = (profile?.name || user?.email || '?').slice(0, 1).toUpperCase();
  const avatarBg = AVATAR_BG[role] || 'bg-orange-500';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Link to={user ? `/${role}` : '/'} className="flex items-center gap-2">
              <Logo />
            </Link>
            {role && (
              <span className={`hidden sm:inline ml-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${ROLE_CHIP[role] || ROLE_CHIP.restaurant}`}>
                {role}
              </span>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-brand-700 font-semibold' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {role === 'restaurant' && (
              <Link to="/restaurant/post" className="btn-primary hidden sm:inline-flex">
                <Plus size={16} /> Post Food
              </Link>
            )}
            {user ? (
              <>
                <NotificationDropdown />
                <div className="hidden sm:flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm ${avatarBg}`} title={profile?.name || user.email}>
                    {initials}
                  </div>
                </div>
                <button onClick={handleSignOut} className="hidden md:inline-flex btn-ghost" title="Sign out">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </div>
            )}

            <button onClick={() => setOpen(!open)} className="md:hidden btn-ghost p-2" aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-slide-up">
            {user && (
              <div className="flex items-center gap-3 px-3 pb-3 mb-1 border-b border-gray-100">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${avatarBg}`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{profile?.name || user.email}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${ROLE_CHIP[role] || ''}`}>{role}</span>
                    {profile?.verified === false && role === 'ngo' && (
                      <span className="text-[10px] text-amber-700">Pending approval</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                Sign out
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 btn-secondary">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1 btn-primary">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
