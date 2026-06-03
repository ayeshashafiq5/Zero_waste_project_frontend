import PropTypes from 'prop-types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

// Standard wrapper for authenticated pages: sticky navbar + max-width content + footer
export const AppShell = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden w-full">
    <Navbar />
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {children}
    </main>
    <Footer />
  </div>
);

AppShell.propTypes = { children: PropTypes.node };
