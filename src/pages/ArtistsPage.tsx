import { useState, useEffect } from 'react';
import { Music, Disc3, Radio, Instagram, Globe, Ticket, Play, X } from 'lucide-react';
import EditableElement from '../components/EditableElement';
import { supabase } from '../lib/supabase';

interface Artist {
  id: string;
  name: string;
  role: 'DJ' | 'Producer' | 'VJ' | 'Live Act' | 'DJ/Producer';
  bio: string;
  image: string;
  genre: string;
  videoUrl?: string;
  youtubeId?: string;
  links?: {
    soundcloud?: string;
    spotify?: string;
    instagram?: string;
    website?: string;
    shotgun?: string;
  };
}

const artists: Artist[] = [
  {
    id: '1',
    name: 'VIRVOLTEK',
    role: 'DJ/Producer',
    bio: 'C\'est l\'alliance brutale de l\'acid et de la hardtechno. Producteur et DJ parisien, il forge depuis 2018 un son incisif et sans concession. Passé derrière les platines à Berlin comme à Babcock, il impose son énergie sombre et radicale. Avec lui, pas de demi-mesure : la rave dans sa forme la plus pure.',
    image: '/VIRVOLTEK copy.jpg',
    genre: 'Acid Hardtechno',
    videoUrl: '/AQNt0bso4oD3qFrTBoiQwXydRCfJpXpz-eY0nOW21gwljJDcUOlk9yKaueQ_TfK_btoRhXbaG5UU-v_8awykrkXixJm8JEqggZarBdQ.mp4',
    links: {
      shotgun: 'https://shotgun.live/artists/virvoltek/music?uhandle=jasonv660',
      instagram: 'https://www.instagram.com/virvoltek/',
    },
  },
  {
    id: '2',
    name: 'DJ ÉPICURIEN',
    role: 'DJ',
    bio: 'Dj Épicurien est un artiste dynamique et passionné qui a su se faire une place dans l\'univers techno en peu de temps. Depuis plus de 2 ans, il enflamme les scènes avec ses sets énergiques et ses sélections pointues, oscillant entre l\'acid techno et la hard indus. Son parcours l\'a mené dans des villes emblématiques de la scène techno mondiale telles que Paris, Lisbonne, Vienne et Washington DC, où il a su captiver les foules avec ses performances intenses et immersives.',
    image: '/DJEPICURIEN copy.jpg',
    genre: 'Acid Techno & Hard Indus',
    links: {
      shotgun: 'https://shotgun.live/fr/artists/alexis-hawkridger-curien',
      instagram: 'https://www.instagram.com/djepicurien',
    },
  },
  {
    id: '3',
    name: 'DJ NIGHT SLAYER',
    role: 'DJ/Producer',
    bio: 'DJ Night Slayer a débuté son parcours musical au Portugal il y a cinq ans avant de revenir en France, où il a récemment marqué un tournant en jouant à son premier festival. Son style est une fusion intense de dark techno et de cyberpunk vibes, inspiré par Daft Punk et l\'énergie brute de la scène techno underground. Chaque performance est un voyage sonore immersif, entre basses percutantes et atmosphères futuristes.',
    image: '/gggggggggggggggggggggggggggggggggggggggggggg copy.jpg',
    genre: 'Hardtechno Indus & Open format',
    videoUrl: '/AQNGlugXEEMg9wO_90KzuMLR415JbYpW774r5cxPZC46-9Slr3fQjECX6rhCm4__nLYar6IRSbJ3TiJKq1qBCsalpPWSP-rvTwx9YNY.mp4',
    links: {
      shotgun: 'https://shotgun.live/fr/artists/djnightsl4yer',
      instagram: 'https://www.instagram.com/djnightsl4yer.meta/',
    },
  },
  {
    id: '4',
    name: 'C0R3',
    role: 'DJ',
    bio: 'DJ et producteur émergent de la scène techno parisienne, C0R3 s\'impose avec son style énergique et ses sélections pointues. Régulièrement programmé dans des événements underground à Paris, notamment au Studio 56, il délivre des sets intenses qui captivent les foules. Son énergie brute et son approche sans concession font de chaque performance un moment marquant de la nuit.',
    image: '/cdj yugi.jpg',
    genre: 'Techno',
    links: {
      shotgun: 'https://shotgun.live/en/artists/c0r3dj',
      instagram: 'https://www.instagram.com/c0r3.dj',
    },
  },
];

type FilterType = 'All' | 'DJ' | 'Producer' | 'VJ' | 'Live Act' | 'DJ/Producer';

function ArtistCard({ artist }: { artist: Artist }) {
  const [showVideo, setShowVideo] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent, url: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'DJ':
        return <Disc3 size={20} />;
      case 'Live Act':
        return <Radio size={20} />;
      case 'VJ':
        return <Music size={20} />;
      default:
        return <Music size={20} />;
    }
  };

  return (
    <article className="group relative bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-red-500 transition-all duration-300 card-focusable" tabIndex={0} role="article" aria-label={`Artiste: ${artist.name} - ${artist.role}`}>
      <div className={showVideo && artist.id === '1' ? "relative h-[600px] overflow-hidden" : "relative h-80 overflow-hidden"}>
        {showVideo && (artist.videoUrl || artist.youtubeId) ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-2 right-2 z-10 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              aria-label="Fermer la vidéo"
            >
              <X size={20} />
            </button>
            {artist.videoUrl ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                loop
                playsInline
                controls
              >
                <source src={artist.videoUrl} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            ) : artist.youtubeId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${artist.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${artist.name} DJ Set`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null}
          </div>
        ) : (
          <>
            <img
              src={artist.image}
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {(artist.videoUrl || artist.youtubeId) && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-red-600/80 hover:bg-red-600 rounded-full transition-all duration-300 hover:scale-110"
                aria-label={`Voir le DJ set de ${artist.name}`}
              >
                <Play size={32} fill="white" />
              </button>
            )}

            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                {getRoleIcon(artist.role)}
                <span className="ml-2">{artist.role}</span>
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-3xl font-bold tracking-wider mb-2">{artist.name}</h3>
              <p className="text-sm text-gray-300 mb-1">{artist.genre}</p>
            </div>
          </>
        )}
      </div>

      {(!showVideo || artist.id === '3') && (
        <div className="p-6">
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{artist.bio}</p>

          {artist.links && (
            <div className="flex space-x-3">
              {artist.links.soundcloud && (
                <a
                  href={artist.links.soundcloud}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                  aria-label={`SoundCloud de ${artist.name}`}
                  onKeyPress={(e) => handleKeyPress(e, artist.links!.soundcloud!)}
                >
                  <Music size={18} aria-hidden="true" />
                  <span className="sr-only">SoundCloud</span>
                </a>
              )}
              {artist.links.spotify && (
                <a
                  href={artist.links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                  aria-label={`Spotify de ${artist.name}`}
                  onKeyPress={(e) => handleKeyPress(e, artist.links!.spotify!)}
                >
                  <Disc3 size={18} aria-hidden="true" />
                  <span className="sr-only">Spotify</span>
                </a>
              )}
              {artist.links.instagram && (
                <a
                  href={artist.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                  aria-label={`Instagram de ${artist.name}`}
                  onKeyPress={(e) => handleKeyPress(e, artist.links!.instagram!)}
                >
                  <Instagram size={18} aria-hidden="true" />
                  <span className="sr-only">Instagram</span>
                </a>
              )}
              {artist.links.website && (
                <a
                  href={artist.links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                  aria-label={`Site web de ${artist.name}`}
                  onKeyPress={(e) => handleKeyPress(e, artist.links!.website!)}
                >
                  <Globe size={18} aria-hidden="true" />
                  <span className="sr-only">Site web</span>
                </a>
              )}
              {artist.links.shotgun && (
                <a
                  href={artist.links.shotgun}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                  aria-label={`Profil Shotgun de ${artist.name}`}
                  onKeyPress={(e) => handleKeyPress(e, artist.links!.shotgun!)}
                >
                  <Ticket size={18} aria-hidden="true" />
                  <span className="sr-only">Shotgun</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function ArtistsPage() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [content, setContent] = useState({
    title: 'NOS ARTISTES',
    subtitle: 'La team RÜMBL // Sound. Light. Energy.'
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .eq('page', 'artists');

    if (data && data.length > 0) {
      const heroSection = data.find(s => s.section === 'hero');
      if (heroSection) {
        setContent({
          title: heroSection.content?.title || content.title,
          subtitle: heroSection.content?.subtitle || content.subtitle
        });
      }
    }
  };

  const filters: FilterType[] = ['All', 'DJ', 'Live Act', 'VJ', 'Producer'];

  const filteredArtists = filter === 'All'
    ? artists
    : artists.filter(artist => artist.role === filter);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <EditableElement
            page="artists"
            section="hero"
            field="title"
            value={content.title}
            as="h1"
            className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow"
            onUpdate={(val) => setContent({...content, title: val})}
          />
          <EditableElement
            page="artists"
            section="hero"
            field="subtitle"
            value={content.subtitle}
            as="p"
            className="text-gray-400 tracking-wide"
            onUpdate={(val) => setContent({...content, subtitle: val})}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-6 py-2 rounded-full font-bold tracking-wider text-sm transition-all duration-300 ${
                filter === filterOption
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>

        {filteredArtists.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucun artiste trouvé dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
