import { Zap, Music, Users, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow">
            À PROPOS
          </h1>
          <p className="text-gray-400 tracking-wide">
            Le collectif underground parisien
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src="/RUMBL.jpg"
              alt="RÜMBL"
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.6) contrast(1.3)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <h2 className="text-4xl font-bold tracking-wider text-red-500">RÜMBL</h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              RÜMBL est un collectif d'événements né de la passion pour la techno underground,
              les raves et l'ambiance brute des warehouses. Basé en banlieue parisienne, nous
              créons des expériences immersives où le son, la lumière et l'énergie fusionnent
              pour offrir des nuits inoubliables.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              Notre ADN : l'authenticité, l'indépendance et une énergie brute sans compromis.
              Chaque événement est une célébration de la culture techno dans ce qu'elle a de
              plus intense et de plus vrai.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-black border border-gray-800 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <Zap className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-bold tracking-wider mb-2">UNDERGROUND</h3>
            <p className="text-gray-400 text-sm">
              Fidèles aux racines de la scène techno alternative et indépendante.
            </p>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <Music className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-bold tracking-wider mb-2">HARD & GROOVY</h3>
            <p className="text-gray-400 text-sm">
              Un mélange explosif de hard techno et de grooves hypnotiques.
            </p>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <Users className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-bold tracking-wider mb-2">COLLECTIF</h3>
            <p className="text-gray-400 text-sm">
              Une équipe soudée de DJs, producteurs et artistes visuels passionnés.
            </p>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <Target className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-bold tracking-wider mb-2">AUTHENTICITÉ</h3>
            <p className="text-gray-400 text-sm">
              Des événements sans artifice, pour une expérience vraie et intense.
            </p>
          </div>
        </div>

        <div className="bg-black border border-red-500/30 rounded-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold tracking-wider mb-6 text-center">NOTRE VISION</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-gray-300 leading-relaxed">
            <p>
              Créer des espaces où la musique techno peut s'exprimer dans toute sa puissance,
              loin des contraintes commerciales et des formats standardisés. Chaque rave RÜMBL
              est pensée pour offrir une immersion totale dans l'univers underground.
            </p>
            <p>
              Nous croyons au pouvoir de la musique pour rassembler, libérer et transcender.
              Notre mission est de perpétuer l'esprit des premières raves : authentiques,
              énergiques et inoubliables.
            </p>
          </div>
        </div>

        <div className="bg-black border border-gray-800 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold tracking-wider mb-8 text-center">L'ÉQUIPE FONDATRICE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="font-bold tracking-wider mb-1">FONDATEUR 1</h3>
              <p className="text-sm text-gray-400">Direction artistique</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Music className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="font-bold tracking-wider mb-1">FONDATEUR 2</h3>
              <p className="text-sm text-gray-400">Programmation musicale</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="font-bold tracking-wider mb-1">FONDATEUR 3</h3>
              <p className="text-sm text-gray-400">Production & logistique</p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-black border border-gray-800 rounded-lg p-8">
          <h3 className="text-2xl font-bold tracking-wider mb-6 text-center">INFORMATIONS LÉGALES</h3>
          <div className="max-w-2xl mx-auto space-y-3 text-gray-300 text-sm">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Association :</span>
              <span className="font-bold">LGBT ÉVEIL NOCTURNE</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">SIRET :</span>
              <span className="font-mono">942 807 397 00016</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Président :</span>
              <span>Nathan Bouclier</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Contact :</span>
              <a href="mailto:Rumbl.techno@gmail.com" className="text-red-500 hover:text-red-400 transition-colors">
                Rumbl.techno@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 tracking-widest text-sm mb-4">
            SOUND. LIGHT. ENERGY.
          </p>
          <div className="w-32 h-1 bg-red-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
