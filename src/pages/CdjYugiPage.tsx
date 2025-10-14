import { useState, useEffect, useRef } from 'react';
import { Music, Disc3, Play } from 'lucide-react';

export default function CdjYugiPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        const maxRotation = 20;
        const rotateY = (deltaX / (rect.width / 2)) * maxRotation;
        const rotateX = -(deltaY / (rect.height / 2)) * maxRotation;

        setMousePosition({ x: e.clientX, y: e.clientY });
        setRotation({ rotateX, rotateY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-30"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-widest mb-4 text-shadow-glow metal-font">
            CDJ YUGI
          </h1>
          <p className="text-xl md:text-2xl text-red-500 tracking-wider font-bold mb-4">
            BY PIONEER DJ
          </p>
          <p className="text-gray-400 tracking-wide max-w-3xl mx-auto text-lg">
            L'arme ultime des DJs RÜMBL : contrôle absolu, performance maximale
          </p>
        </div>

        <div
          ref={imageRef}
          className="mb-16 flex justify-center items-center"
          style={{ perspective: '2000px' }}
        >
          <div className="relative">
            <img
              src="/cdj yugi.jpg"
              alt="CDJ Yugi Pioneer DJ"
              className="max-w-full h-auto rounded-lg shadow-2xl transition-transform duration-100 ease-out"
              style={{
                transform: `rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg) scale(1.05)`,
                transformStyle: 'preserve-3d',
                maxWidth: '900px',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg pointer-events-none"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-black border border-red-500/30 rounded-lg p-8 hover:border-red-500 transition-all duration-300">
            <h2 className="text-3xl font-bold tracking-wider mb-6 metal-font text-red-500">
              ÉQUIPEMENT PRO
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Le CDJ Yugi de Pioneer DJ est l'équipement de référence pour tous les DJs
              du collectif RÜMBL. Cette platine professionnelle offre une précision
              exceptionnelle et des fonctionnalités avancées pour des performances live
              inoubliables.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Utilisé lors de tous nos événements, le CDJ Yugi permet à nos artistes de
              pousser les limites de la créativité avec des transitions fluides, des effets
              en temps réel et un contrôle total sur chaque élément du mix.
            </p>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold tracking-wider mb-6 metal-font">
              CARACTÉRISTIQUES
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Play className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">ÉCRAN TACTILE HD</h4>
                  <p className="text-sm text-gray-400">
                    Interface intuitive pour un contrôle précis de la forme d'onde
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Disc3 className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">JOG WHEEL RESPONSIVE</h4>
                  <p className="text-sm text-gray-400">
                    Manipulation ultra-précise pour scratching et beatmatching
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Music className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">EFFETS INTÉGRÉS</h4>
                  <p className="text-sm text-gray-400">
                    Palette complète d'effets professionnels pour enrichir vos sets
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Music className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">COMPATIBILITÉ TOTALE</h4>
                  <p className="text-sm text-gray-400">
                    Support USB, SD, et streaming depuis Rekordbox
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-black border border-gray-800 rounded-lg p-6 text-center hover:border-red-500 transition-all duration-300">
            <div className="text-5xl font-bold text-red-500 mb-2">100%</div>
            <h4 className="font-bold mb-2 tracking-wider">FIABILITÉ</h4>
            <p className="text-sm text-gray-400">
              Utilisé par les plus grands DJs du monde entier
            </p>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-6 text-center hover:border-red-500 transition-all duration-300">
            <div className="text-5xl font-bold text-red-500 mb-2">∞</div>
            <h4 className="font-bold mb-2 tracking-wider">CRÉATIVITÉ</h4>
            <p className="text-sm text-gray-400">
              Possibilités infinies pour exprimer votre style
            </p>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-6 text-center hover:border-red-500 transition-all duration-300">
            <div className="text-5xl font-bold text-red-500 mb-2">PRO</div>
            <h4 className="font-bold mb-2 tracking-wider">STANDARD</h4>
            <p className="text-sm text-gray-400">
              Le choix des professionnels de la techno
            </p>
          </div>
        </div>

        <div className="bg-black border border-red-500/30 rounded-lg p-8 md:p-12 text-center">
          <Disc3 className="w-16 h-16 text-red-500 mx-auto mb-6 animate-spin" style={{ animationDuration: '4s' }} />
          <h2 className="text-3xl font-bold tracking-wider mb-6 metal-font">
            L'ÉQUIPEMENT DE TOUS NOS ÉVÉNEMENTS
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto mb-8 text-lg leading-relaxed">
            Chaque événement RÜMBL est équipé de CDJ Yugi pour garantir la meilleure qualité
            sonore et une expérience DJ professionnelle. Nos artistes disposent du meilleur
            matériel pour délivrer des performances mémorables et pousser les limites de la
            techno underground.
          </p>
          <div className="inline-block bg-gray-900 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 mb-2">Setup standard RÜMBL</p>
            <p className="text-2xl font-bold text-red-500 tracking-wider">
              4x CDJ YUGI + DJM-900NXS2
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 tracking-widest text-sm mb-4">
            BOUGE TA SOURIS POUR VOIR LE CDJ EN 3D
          </p>
          <div className="w-32 h-1 bg-red-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
