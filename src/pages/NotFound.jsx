import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col">
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/"><Logo stacked /></Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-2">🍽️</div>
          <div className="text-7xl font-extrabold text-brand-600">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Page not found</h1>
          <p className="text-gray-600 mt-2">
            The page you&apos;re looking for has either expired or never existed — much like surplus food without a connection.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
            <Link to="/" className="btn-primary">
              <ArrowLeft size={16} /> Back to home
            </Link>
            <Link to="/login" className="btn-secondary">Sign in</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
