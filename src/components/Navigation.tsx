import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

type Page = 'home' | 'events' | 'artists' | 'booking' | 'about' | 'ambassadeurs' | 'ambassador-leaderboard' | 'admin-ambassadors' | 'merch' | 'exoskeleton' | 'cdj-yugi';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useKeyboardNavigation(mobileMenuRef, {
    onEscape: () => setIsMenuOpen(false),
    trapFocus: isMenuOpen,
    autoFocus: isMenuOpen,
  });

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      menuButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems: { page: Page; label: string }[] = [
    { page: 'home', label: 'HOME' },
    { page: 'events', label: 'ÉVÉNEMENTS' },
    { page: 'artists', label: 'ARTISTES' },
    { page: 'ambassadeurs', label: 'AMBASSADEURS' },
    { page: 'merch', label: 'MERCH' },
    { page: 'exoskeleton', label: 'EXOSKELETON' },
    { page: 'cdj-yugi', label: 'CDJ YUGI' },
    { page: 'booking', label: 'BOOKING' },
    { page: 'about', label: 'À PROPOS' },
  ];

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => handleNavigate('home')}
              className="text-2xl font-bold tracking-widest hover:text-red-500 transition-colors metal-font"
              aria-label="Retour à l'accueil RÜMBL"
            >
              RÜMBL
            </button>

            <div className="hidden lg:flex space-x-6">
              {navItems.map(({ page, label }) => (
                <button
                  key={page}
                  onClick={() => handleNavigate(page)}
                  className={`text-sm tracking-wider transition-all hover:text-red-500 ${
                    currentPage === page
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-gray-300'
                  }`}
                  aria-label={`Naviguer vers ${label}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white hover:text-red-500 transition-colors"
              aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          <div className="flex flex-col items-center justify-center h-full space-y-6 overflow-y-auto py-20">
            {navItems.map(({ page, label }) => (
              <button
                key={page}
                onClick={() => handleNavigate(page)}
                className={`text-xl tracking-widest transition-all hover:text-red-500 metal-font ${
                  currentPage === page ? 'text-red-500' : 'text-gray-300'
                }`}
                aria-label={`Naviguer vers ${label}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
