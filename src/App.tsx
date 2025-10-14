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
import AdminToolbar from './components/AdminToolbar';
import RadioPlayer from './components/RadioPlayer';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import AmbassadorLoginPage from './pages/AmbassadorLoginPage';
import AdminArtistsPage from './pages/AdminArtistsPage';
import AmbassadorQuestsPage from './pages/AmbassadorQuestsPage';
import AmbassadorProfileEditPage from './pages/AmbassadorProfileEditPage';
import AdminQuestsPage from './pages/AdminQuestsPage';
import { supabase } from './lib/supabase';

type Page = 'home' | 'events' | 'artists' | 'booking' | 'about' | 'ambassadeurs' | 'ambassador-leaderboard' | 'ambassador-dashboard' | 'ambassador-profile' | 'ambassador-profile-edit' | 'ambassador-quests' | 'ambassador-login' | 'admin-ambassadors' | 'admin-artists' | 'admin-quests' | 'admin-cms' | 'admin-edit-content' | 'merch' | 'exoskeleton' | 'cdj-yugi';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [editPageParam, setEditPageParam] = useState<string>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);
  const { isAdminMode, setIsAdminMode } = useAdmin();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

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
      case 'ambassador-login':
        return <AmbassadorLoginPage onLogin={() => {
          checkAuth();
          setCurrentPage('ambassador-dashboard');
        }} />;
      case 'ambassador-dashboard':
        return isAuthenticated ? <AmbassadorDashboardPage /> : <AmbassadorLoginPage onLogin={() => {
          checkAuth();
          setCurrentPage('ambassador-dashboard');
        }} />;
      case 'ambassador-profile':
        return isAuthenticated ? <AmbassadorProfilePage /> : <AmbassadorLoginPage onLogin={() => {
          checkAuth();
          setCurrentPage('ambassador-profile');
        }} />;
      case 'ambassador-profile-edit':
        return isAuthenticated ? <AmbassadorProfileEditPage /> : <AmbassadorLoginPage onLogin={() => {
          checkAuth();
          setCurrentPage('ambassador-profile-edit');
        }} />;
      case 'ambassador-quests':
        return isAuthenticated ? <AmbassadorQuestsPage /> : <AmbassadorLoginPage onLogin={() => {
          checkAuth();
          setCurrentPage('ambassador-quests');
        }} />;
      case 'admin-ambassadors':
        return <AdminAmbassadorsPage />;
      case 'admin-artists':
        return <AdminArtistsPage />;
      case 'admin-quests':
        return <AdminQuestsPage />;
      case 'admin-cms':
        return <AdminCMSPage onNavigateToEdit={(page) => {
          setIsAdminMode(true);
          setCurrentPage(page as Page);
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
      <AdminToolbar onExit={() => {
        setIsAdminMode(false);
        setCurrentPage('admin-cms');
      }} />
      <BarbedWireBackground />
      {currentPage !== 'home' && currentPage !== 'admin-cms' && currentPage !== 'admin-edit-content' && currentPage !== 'admin-artists' && currentPage !== 'ambassador-login' && !isAdminMode && <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />}
      <main id="main-content" ref={mainContentRef} tabIndex={-1} style={{ paddingTop: isAdminMode ? '80px' : '0', paddingBottom: '100px' }}>
        {renderPage()}
      </main>
      {currentPage !== 'admin-cms' && currentPage !== 'admin-edit-content' && currentPage !== 'admin-artists' && <RadioPlayer />}
    </div>
  );
}

function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}

export default App;
