import { useState, useEffect, useRef } from 'react';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import ArtistsPage from './pages/ArtistsPage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import AmbassadeursPage from './pages/AmbassadeursPage';
import AmbassadorLeaderboardPage from './pages/AmbassadorLeaderboardPage';
import AmbassadorDashboardPage from './pages/AmbassadorDashboardPage';
import AmbassadorProfilePage from './pages/AmbassadorProfilePage';
import AdminAmbassadorsPage from './pages/AdminAmbassadorsPage';
import AdminCMSPage from './pages/AdminCMSPage';
import AdminEditContentPage from './pages/AdminEditContentPage';
import MerchPage from './pages/MerchPage';
import ExoskeletonPage from './pages/ExoskeletonPage';
import CdjYugiPage from './pages/CdjYugiPage';
import Navigation from './components/Navigation';
import BarbedWireBackground from './components/BarbedWireBackground';

type Page = 'home' | 'events' | 'artists' | 'booking' | 'about' | 'ambassadeurs' | 'ambassador-leaderboard' | 'ambassador-dashboard' | 'ambassador-profile' | 'admin-ambassadors' | 'admin-cms' | 'admin-edit-content' | 'merch' | 'exoskeleton' | 'cdj-yugi';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [editPageParam, setEditPageParam] = useState<string>('home');
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setCurrentPage('admin-cms');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'events':
        return <EventsPage />;
      case 'artists':
        return <ArtistsPage />;
      case 'booking':
        return <BookingPage />;
      case 'about':
        return <AboutPage />;
      case 'ambassadeurs':
        return <AmbassadeursPage />;
      case 'ambassador-leaderboard':
        return <AmbassadorLeaderboardPage />;
      case 'ambassador-dashboard':
        return <AmbassadorDashboardPage />;
      case 'ambassador-profile':
        return <AmbassadorProfilePage />;
      case 'admin-ambassadors':
        return <AdminAmbassadorsPage />;
      case 'admin-cms':
        return <AdminCMSPage onNavigateToEdit={(page) => {
          setEditPageParam(page);
          setCurrentPage('admin-edit-content');
        }} />;
      case 'admin-edit-content':
        return <AdminEditContentPage page={editPageParam} onBack={() => setCurrentPage('admin-cms')} />;
      case 'merch':
        return <MerchPage />;
      case 'exoskeleton':
        return <ExoskeletonPage />;
      case 'cdj-yugi':
        return <CdjYugiPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <BarbedWireBackground />
      {currentPage !== 'home' && currentPage !== 'admin-cms' && currentPage !== 'admin-edit-content' && <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />}
      <main id="main-content" ref={mainContentRef} tabIndex={-1}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
