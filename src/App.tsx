import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import ArtistsPage from './pages/ArtistsPage';
import AdminCMSPage from './pages/AdminCMSPage';

type Page = 'home' | 'events' | 'artists' | 'booking' | 'about';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminPanel(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (showAdminPanel) {
    return <AdminCMSPage />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'artists' && <ArtistsPage />}
    </div>
  );
}

export default App;
