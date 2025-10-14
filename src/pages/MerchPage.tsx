import { useState, useEffect, Suspense } from 'react';
import { ShoppingCart, Package, Shirt, ExternalLink } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

interface MerchItem {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  category: 'Vêtements' | 'Accessoires' | 'Stickers';
  available: boolean;
}

const merchItems: MerchItem[] = [
  {
    id: '1',
    name: 'T-Shirt RÜMBL Logo',
    price: '25€',
    image: '/RUMBL copy.jpg',
    description: 'T-shirt noir avec logo métallique RÜMBL imprimé au dos',
    category: 'Vêtements',
    available: true,
  },
  {
    id: '2',
    name: 'Hoodie RÜMBL',
    price: '45€',
    image: '/RUMBL copy.jpg',
    description: 'Sweat à capuche premium avec logo RÜMBL brodé',
    category: 'Vêtements',
    available: true,
  },
  {
    id: '3',
    name: 'Casquette RÜMBL',
    price: '20€',
    image: '/RUMBL copy.jpg',
    description: 'Casquette snapback noire avec logo RÜMBL brodé',
    category: 'Accessoires',
    available: true,
  },
  {
    id: '4',
    name: 'Tote Bag RÜMBL',
    price: '15€',
    image: '/RUMBL copy.jpg',
    description: 'Sac en toile noir avec impression RÜMBL',
    category: 'Accessoires',
    available: false,
  },
  {
    id: '5',
    name: 'Pack Stickers RÜMBL',
    price: '5€',
    image: '/RUMBL copy.jpg',
    description: 'Pack de 5 stickers résistants RÜMBL',
    category: 'Stickers',
    available: true,
  },
  {
    id: '6',
    name: 'Bandana RÜMBL',
    price: '12€',
    image: '/RUMBL copy.jpg',
    description: 'Bandana noir avec motifs RÜMBL',
    category: 'Accessoires',
    available: true,
  },
];

function Logo3D({ mousePosition, isMobile }: { mousePosition: { x: number; y: number }; isMobile: boolean }) {
  const { scene } = useGLTF('/892823217a82490cb65ba4e6fffb5337.glb');
  const clonedScene = scene.clone();

  useFrame(() => {
    if (clonedScene) {
      clonedScene.rotation.y = mousePosition.x * 0.8;
      clonedScene.rotation.x = mousePosition.y * -0.5;
    }
  });

  const scale = isMobile ? 2 : 2.5;
  return <primitive object={clonedScene} scale={scale} />;
}

function MerchCard({ item, mousePosition, isMobile }: { item: MerchItem; mousePosition: { x: number; y: number }; isMobile: boolean }) {
  return (
    <div className="group bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-red-500 transition-all duration-300">
      <div className="relative h-64 overflow-hidden bg-black">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            <Logo3D mousePosition={mousePosition} isMobile={isMobile} />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {!item.available && (
          <div className="absolute top-4 right-4">
            <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-bold">
              BIENTÔT DISPO
            </span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block bg-red-600/90 text-white px-2 py-1 rounded text-xs font-bold mb-2">
            {item.category}
          </span>
          <h3 className="text-xl font-bold tracking-wider">{item.name}</h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-400 text-sm mb-4">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-red-500">{item.price}</span>

          {item.available ? (
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-bold tracking-wider transition-all duration-300 transform hover:scale-105 flex items-center">
              <ShoppingCart size={18} className="mr-2" />
              ACHETER
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-700 text-gray-400 px-6 py-2 rounded-md font-bold tracking-wider cursor-not-allowed"
            >
              BIENTÔT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MerchPage() {
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

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow metal-font">
            MERCH RÜMBL
          </h1>
          <p className="text-gray-400 tracking-wide max-w-2xl mx-auto">
            Porte les couleurs du collectif underground parisien
          </p>
        </div>

        <div className="bg-black border border-red-500/30 rounded-lg p-6 mb-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold tracking-wider metal-font">INFO LIVRAISON</h2>
          </div>
          <div className="text-center text-gray-300 space-y-2">
            <p>Livraison gratuite en France à partir de 50€</p>
            <p className="text-sm text-gray-400">
              Les commandes sont expédiées sous 3-5 jours ouvrés
            </p>
            <p className="text-sm text-gray-400">
              Retrait possible lors des événements RÜMBL
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {merchItems.map((item) => (
            <MerchCard key={item.id} item={item} mousePosition={mousePosition} isMobile={isMobile} />
          ))}
        </div>

        <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
          <Shirt className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold tracking-wider mb-4 metal-font">
            BOUTIQUE EN LIGNE BIENTÔT DISPONIBLE
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Notre boutique en ligne officielle sera bientôt lancée. En attendant, retrouve
            nos articles lors de nos événements ou contacte-nous pour commander.
          </p>
          <a
            href="mailto:contact@rumbl.tech"
            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-bold tracking-wider transition-all duration-300 transform hover:scale-105"
          >
            <ExternalLink size={20} className="mr-2" />
            NOUS CONTACTER
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/50 border border-gray-800 rounded-lg p-6 text-center">
            <h4 className="font-bold mb-2 tracking-wider">QUALITÉ PREMIUM</h4>
            <p className="text-sm text-gray-400">
              Matériaux de haute qualité et impressions durables
            </p>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-lg p-6 text-center">
            <h4 className="font-bold mb-2 tracking-wider">DESIGN EXCLUSIF</h4>
            <p className="text-sm text-gray-400">
              Créations originales inspirées de la scène underground
            </p>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-lg p-6 text-center">
            <h4 className="font-bold mb-2 tracking-wider">SUPPORT LOCAL</h4>
            <p className="text-sm text-gray-400">
              Chaque achat soutient le collectif et nos événements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
