import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

export default function Offline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 py-3 flex items-center gap-3 text-sm">
        <div className="text-yellow-700">⚠️</div>
        <div className="flex-1">
          <span className="font-bold text-yellow-900">{online ? "You're back online." : "You're offline."}</span>
          <span className="text-yellow-800"> {online ? 'Refresh to sync.' : 'Showing the last cached state.'}</span>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs font-semibold text-yellow-900 underline">
          Retry
        </button>
      </div>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg text-center">
          <div className="text-6xl">📡</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4">No internet connection</h1>
          <p className="text-gray-600 mt-2">
            You can keep browsing cached pages. Queued actions will sync the moment you&apos;re back online.
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => window.location.reload()} className="btn-primary"><RefreshCw size={16} /> Try again</button>
            <Link to="/" className="btn-secondary">Back to home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
