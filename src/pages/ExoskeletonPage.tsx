import { Zap, Music, Lightbulb, Radio, Box } from 'lucide-react';

export default function ExoskeletonPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-widest mb-4 text-shadow-glow metal-font">
            EXOSKELETON
          </h1>
          <p className="text-xl md:text-2xl text-red-500 tracking-wider font-bold mb-4">
            PROJET RÜMBL
          </p>
          <p className="text-gray-400 tracking-wide max-w-3xl mx-auto text-lg">
            Habillages personnalisés pour CDJ, DJM et RX3 - L'équipement qui fait vibrer la scène
          </p>
        </div>

        <div className="relative mb-16">
          <div className="aspect-video bg-black border border-red-500 rounded-lg overflow-hidden">
            <img
              src="/RUMBL.jpg"
              alt="Exoskeleton Project"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 flex items-center justify-center">
              <div className="text-center">
                <Box className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />
                <p className="text-2xl font-bold tracking-widest metal-font">
                  EN DÉVELOPPEMENT
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-wider text-red-500 metal-font">
              LE CONCEPT
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              Exoskeleton, c'est l'habillage ultime pour ton matériel DJ. Des coques personnalisées
              et des designs uniques qui transforment tes CDJ, DJM et RX3 en véritables œuvres d'art
              techno. Inspiré par l'esthétique underground et la culture rave, chaque pièce est
              conçue pour faire ressortir l'identité RÜMBL.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              Plus qu'un simple accessoire, Exoskeleton protège ton équipement tout en le rendant
              unique. Matériaux résistants, finitions métalliques, LED intégrées optionnelles :
              ton setup devient aussi impressionnant que ta musique.
            </p>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold tracking-wider mb-6 metal-font">
              CARACTÉRISTIQUES
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Box className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">HABILLAGES CDJ</h4>
                  <p className="text-sm text-gray-400">
                    Coques personnalisées pour Pioneer CDJ-2000/3000 - Design RÜMBL exclusif
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Box className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">SKINS DJM</h4>
                  <p className="text-sm text-gray-400">
                    Revêtements pour tables de mixage DJM avec finitions métalliques
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Box className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">PROTECTION RX3</h4>
                  <p className="text-sm text-gray-400">
                    Habillages renforcés pour Pioneer RX3 - Style et protection maximale
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Lightbulb className="w-6 h-6 text-red-500 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">OPTIONS LED</h4>
                  <p className="text-sm text-gray-400">
                    Intégration LED personnalisable pour un setup qui brille dans le noir
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black border border-red-500/30 rounded-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold tracking-wider mb-6 text-center metal-font">
            LA VISION
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-gray-300 leading-relaxed text-center">
            <p className="text-lg">
              Exoskeleton représente l'identité visuelle de RÜMBL appliquée directement sur ton
              équipement. Chaque habillage est fabriqué sur mesure, avec des matériaux de qualité
              professionnelle qui résistent aux conditions les plus extrêmes des raves et warehouses.
            </p>
            <p className="text-red-500 font-bold text-xl mt-6">
              "Ton setup, ton style, ton identité."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-black border border-gray-800 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <div className="text-4xl font-bold text-red-500 mb-2">01</div>
            <h3 className="text-xl font-bold tracking-wider mb-2">DESIGN</h3>
            <p className="text-sm text-gray-400">
              Création des modèles et prototypes pour CDJ, DJM et RX3
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">80% complété</p>
            </div>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <div className="text-4xl font-bold text-red-500 mb-2">02</div>
            <h3 className="text-xl font-bold tracking-wider mb-2">PRODUCTION</h3>
            <p className="text-sm text-gray-400">
              Fabrication des premiers habillages et tests de durabilité
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">45% complété</p>
            </div>
          </div>

          <div className="bg-black border border-gray-800 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <div className="text-4xl font-bold text-red-500 mb-2">03</div>
            <h3 className="text-xl font-bold tracking-wider mb-2">LANCEMENT</h3>
            <p className="text-sm text-gray-400">
              Commercialisation et disponibilité pour tous les DJs
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-gray-600 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">À venir</p>
            </div>
          </div>
        </div>

        <div className="bg-black border border-gray-800 rounded-lg p-8 text-center">
          <Box className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold tracking-wider mb-4 metal-font">
            SUIVRE L'ÉVOLUTION DU PROJET
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Les habillages Exoskeleton sont en cours de développement. Suis nos réseaux pour
            découvrir les premiers prototypes, les options de personnalisation disponibles et
            réserver ton kit dès le lancement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.instagram.com/rumbl_rave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-bold tracking-wider transition-all duration-300 transform hover:scale-105"
            >
              INSTAGRAM
            </a>
            <a
              href="https://shotgun.live/venues/rumbl-rave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-md font-bold tracking-wider transition-all duration-300"
            >
              SHOTGUN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
