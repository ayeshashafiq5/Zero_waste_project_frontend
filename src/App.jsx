import { Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import Offline from './pages/Offline';

import RestaurantDashboard from './pages/restaurant/Dashboard';
import PostFood from './pages/restaurant/PostFood';
import MyListings from './pages/restaurant/MyListings';
import RestaurantProfile from './pages/restaurant/Profile';
import RestaurantRatings from './pages/restaurant/Ratings';
import ListingDetail from './pages/restaurant/ListingDetail';

import NGODashboard from './pages/ngo/Dashboard';
import Browse from './pages/ngo/Browse';
import Accepted from './pages/ngo/Accepted';
import NGOProfile from './pages/ngo/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import AdminAnalytics from './pages/admin/Analytics';

function PublicOnly({ children }) {
  const { user, role, loading } = useAuth();
  // IMPORTANT: don't block on `loading`. Rendering the login/register form is
  // safe even while we wait for the auth check — the redirect below fires
  // automatically as soon as a real session resolves. Blocking causes
  // long blank-spinner pages on slow networks (or when Supabase is sluggish)
  // and was hiding the TestCredentials badge.
  if (!loading && user && role) {
    return <Navigate to={role === 'ngo' ? '/ngo' : role === 'admin' ? '/admin' : '/restaurant'} replace />;
  }
  return children;
}
PublicOnly.propTypes = { children: PropTypes.node.isRequired };

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/offline" element={<Offline />} />

      {/* Restaurant */}
      <Route element={<ProtectedRoute allowedRole="restaurant" />}>
        <Route path="/restaurant" element={<RestaurantDashboard />} />
        <Route path="/restaurant/post" element={<PostFood />} />
        <Route path="/restaurant/listings" element={<MyListings />} />
        <Route path="/restaurant/listings/:id" element={<ListingDetail />} />
        <Route path="/restaurant/ratings" element={<RestaurantRatings />} />
        <Route path="/restaurant/profile" element={<RestaurantProfile />} />
      </Route>

      {/* NGO */}
      <Route element={<ProtectedRoute allowedRole="ngo" />}>
        <Route path="/ngo" element={<NGODashboard />} />
        <Route path="/ngo/browse" element={<Browse />} />
        <Route path="/ngo/accepted" element={<Accepted />} />
        <Route path="/ngo/profile" element={<NGOProfile />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
