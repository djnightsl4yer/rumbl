import { useState, useEffect, Suspense } from 'react';
import { Calendar, Users, Mail } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type Page = 'home' | 'events' | 'artists' | 'booking' | 'about';
type LogoView = 'front' | 'side' | 'tilt' | 'rotate';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

function Logo3D({ mousePosition, isMobile }: { mousePosition: { x: number; y: number }; isMobile: boolean }) {
  const { scene } = useGLTF('/6f8b507c8a8b4aa4a0b099874e327d8e.glb');

  useFrame((state) => {
    if (scene) {
      scene.rotation.y = mousePosition.x * 0.8;
      scene.rotation.x = mousePosition.y * -0.5;
    }
  });

  const scale = isMobile ? 85 : 155;
  return <primitive object={scene} scale={scale} />;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [logoTransform, setLogoTransform] = useState('rotateY(0deg) rotateX(0deg) scale(1)');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const x = (touch.clientX / window.innerWidth - 0.5) * 2;
        const y = (touch.clientY / window.innerHeight - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleLogoView = (view: LogoView, page?: Page) => {
    if (view === 'front') {
      setLogoTransform('rotateY(0deg) rotateX(0deg) scale(1)');
      if (page) onNavigate(page);
    } else if (view === 'side') {
      setLogoTransform('rotateY(60deg) scale(1)');
      if (page) setTimeout(() => onNavigate(page), 400);
    } else if (view === 'tilt') {
      setLogoTransform('rotateX(25deg) rotateY(-20deg) scale(1.1)');
      if (page) setTimeout(() => onNavigate(page), 400);
    } else if (view === 'rotate') {
      setLogoTransform('rotateY(360deg)');
      if (page) setTimeout(() => onNavigate(page), 400);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-black" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4" style={{ perspective: '1000px' }}>
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-8 flex justify-center w-full" style={{
            width: '100%',
            maxWidth: '90vw',
            aspectRatio: '16/9',
            height: isMobile ? '50vh' : '60vh'
          }}>
            <Canvas camera={{ position: [0, 0, isMobile ? 50 : 100], fov: isMobile ? 75 : 85 }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={2.5} />
              <pointLight position={[-5, -5, -5]} intensity={1} color="#ffffff" />
              <Suspense fallback={null}>
                <Logo3D mousePosition={mousePosition} isMobile={isMobile} />
              </Suspense>
            </Canvas>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 tracking-wide font-light max-w-2xl mx-auto">
            From the underground to your senses.
          </p>
          <div className="mt-4 text-sm md:text-base text-gray-400 tracking-widest">
            Hard & Groovy Techno // Paris banlieue
          </div>
          <div className="mt-2 text-sm text-gray-500 tracking-wide">
            Warehouse & chaos maîtrisé
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-red-500/30 p-8 rounded-lg mb-12 max-w-2xl hover:border-red-500 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4 text-red-500 tracking-wider">
            PROCHAIN ÉVÉNEMENT
          </h2>
          <div className="space-y-2 text-gray-300">
            <p className="text-lg">TBA - Date à venir</p>
            <p className="text-sm text-gray-400">Lieu à confirmer</p>
          </div>
          <a
            href="https://shotgun.live/venues/rumbl-rave"
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
            onClick={() => handleLogoView('front', 'home')}
            onMouseEnter={() => handleLogoView('front')}
            className="group bg-black/40 backdrop-blur-sm border border-gray-700 hover:border-red-500 p-6 rounded-lg transition-all duration-300 hover:bg-black/60"
            aria-label="Retour à l'accueil"
          >
            <Calendar className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="block text-sm tracking-wider">ACCUEIL</span>
          </button>

          <button
            onClick={() => handleLogoView('side', 'events')}
            onMouseEnter={() => handleLogoView('side')}
            className="group bg-black/40 backdrop-blur-sm border border-gray-700 hover:border-red-500 p-6 rounded-lg transition-all duration-300 hover:bg-black/60"
            aria-label="Voir tous les événements RÜMBL"
          >
            <Calendar className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="block text-sm tracking-wider">ÉVÉNEMENTS</span>
          </button>

          <button
            onClick={() => handleLogoView('tilt', 'artists')}
            onMouseEnter={() => handleLogoView('tilt')}
            className="group bg-black/40 backdrop-blur-sm border border-gray-700 hover:border-red-500 p-6 rounded-lg transition-all duration-300 hover:bg-black/60"
            aria-label="Découvrir nos artistes"
          >
            <Users className="w-8 h-8 mx-auto mb-3 text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="block text-sm tracking-wider">NOS ARTISTES</span>
          </button>

          <button
            onClick={() => handleLogoView('rotate', 'booking')}
            onMouseEnter={() => handleLogoView('rotate')}
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
    </div>
  );
}
