import { useState, useEffect } from 'react';
import { Calendar, Users, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Page = 'home' | 'events' | 'artists' | 'booking' | 'about';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

interface PageContent {
  hero?: {
    title?: string;
    subtitle?: string;
    tagline?: string;
    description?: string;
  };
  next_event?: {
    title?: string;
    event?: string;
    location?: string;
    shotgun_url?: string;
  };
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [content, setContent] = useState<PageContent>({
    hero: {
      title: 'RÜMBL',
      subtitle: 'From the underground to your senses.',
      tagline: 'Hard & Groovy Techno // Paris banlieue',
      description: 'Warehouse & chaos maîtrisé'
    },
    next_event: {
      title: 'PROCHAIN ÉVÉNEMENT',
      event: 'TBA - Date à venir',
      location: 'Lieu à confirmer',
      shotgun_url: 'https://shotgun.live/venues/rumbl-rave'
    }
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'home');

        if (error) throw error;

        if (data && data.length > 0) {
          const contentObj: PageContent = {};
          data.forEach(item => {
            contentObj[item.section as keyof PageContent] = item.content;
          });
          setContent(contentObj);
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();

    const subscription = supabase
      .channel('site_content_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content', filter: 'page=eq.home' }, () => {
        loadContent();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-red-950" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-8xl md:text-9xl font-black mb-8 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600 drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]">
            {content.hero?.title || 'RÜMBL'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 tracking-wide font-light max-w-2xl mx-auto mb-4">
            {content.hero?.subtitle}
          </p>
          <div className="mt-4 text-sm md:text-base text-gray-400 tracking-widest">
            {content.hero?.tagline}
          </div>
          <div className="mt-2 text-sm text-gray-500 tracking-wide">
            {content.hero?.description}
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-red-500/30 p-8 rounded-lg mb-12 max-w-2xl hover:border-red-500 transition-all duration-300 w-full">
          <h2 className="text-2xl font-bold mb-4 text-red-500 tracking-wider">
            {content.next_event?.title}
          </h2>
          <div className="space-y-2 text-gray-300">
            <p className="text-lg">{content.next_event?.event}</p>
            <p className="text-sm text-gray-400">{content.next_event?.location}</p>
          </div>
          <a
            href={content.next_event?.shotgun_url || 'https://shotgun.live/venues/rumbl-rave'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-bold tracking-wider transition-all duration-300 transform hover:scale-105"
            aria-label="Acheter des billets sur Shotgun"
          >
            BILLETS SHOTGUN
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <button
            onClick={() => onNavigate('home')}
            className="group bg-black/40 backdrop-blur-sm border border-gray-700 hover:border-red-500 p-6 rounded-lg transition-all duration-300 hover:bg-black/60"
            aria-label="Retour à l'accueil"
          >
            <Calendar className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="block text-sm tracking-wider">ACCUEIL</span>
          </button>

          <button
            onClick={() => onNavigate('events')}
            className="group bg-black/40 backdrop-blur-sm border border-gray-700 hover:border-red-500 p-6 rounded-lg transition-all duration-300 hover:bg-black/60"
            aria-label="Voir tous les événements RÜMBL"
          >
            <Calendar className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="block text-sm tracking-wider">ÉVÉNEMENTS</span>
          </button>

          <button
            onClick={() => onNavigate('artists')}
            className="group bg-black/40 backdrop-blur-sm border border-gray-700 hover:border-red-500 p-6 rounded-lg transition-all duration-300 hover:bg-black/60"
            aria-label="Découvrir nos artistes"
          >
            <Users className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="block text-sm tracking-wider">NOS ARTISTES</span>
          </button>

          <button
            onClick={() => onNavigate('booking')}
            className="group bg-black/40 backdrop-blur-sm border border-gray-700 hover:border-red-500 p-6 rounded-lg transition-all duration-300 hover:bg-black/60"
            aria-label="Nous contacter pour un booking"
          >
            <Mail className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="block text-sm tracking-wider">BOOKING</span>
          </button>
        </div>

        <div className="mt-16 flex space-x-6">
          <a
            href="https://www.instagram.com/rumbl_rave"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-red-500 transition-colors text-sm tracking-wider"
            aria-label="Suivez-nous sur Instagram"
          >
            INSTAGRAM
          </a>
          <a
            href="https://shotgun.live/venues/rumbl-rave"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-red-500 transition-colors text-sm tracking-wider"
            aria-label="Réservez vos billets sur Shotgun"
          >
            SHOTGUN
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}
