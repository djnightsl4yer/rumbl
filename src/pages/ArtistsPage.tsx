import { useState, useEffect } from 'react';
import { Music, Disc3, Instagram, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Artist {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  instagram?: string;
  soundcloud?: string;
  spotify?: string;
  website?: string;
  is_active: boolean;
  order_index: number;
}

type FilterType = 'All' | 'DJ' | 'Producer' | 'VJ' | 'Live Act' | 'DJ/Producer';

function ArtistCard({ artist }: { artist: Artist }) {
  const handleKeyPress = (e: React.KeyboardEvent, url: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden hover:border-red-500 transition-all duration-300 group">
      <div className="relative h-80 overflow-hidden">
        <img
          src={artist.image_url}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold mb-1">{artist.name}</h3>
          <div className="flex items-center space-x-2">
            <Disc3 size={16} className="text-red-500" />
            <span className="text-sm text-gray-400 uppercase tracking-wider">{artist.role}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{artist.bio}</p>

        {(artist.soundcloud || artist.spotify || artist.instagram || artist.website) && (
          <div className="flex space-x-3">
            {artist.soundcloud && (
              <a
                href={artist.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                aria-label={`SoundCloud de ${artist.name}`}
                onKeyPress={(e) => handleKeyPress(e, artist.soundcloud!)}
              >
                <Music size={18} aria-hidden="true" />
                <span className="sr-only">SoundCloud</span>
              </a>
            )}
            {artist.spotify && (
              <a
                href={artist.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                aria-label={`Spotify de ${artist.name}`}
                onKeyPress={(e) => handleKeyPress(e, artist.spotify!)}
              >
                <Disc3 size={18} aria-hidden="true" />
                <span className="sr-only">Spotify</span>
              </a>
            )}
            {artist.instagram && (
              <a
                href={artist.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                aria-label={`Instagram de ${artist.name}`}
                onKeyPress={(e) => handleKeyPress(e, artist.instagram!)}
              >
                <Instagram size={18} aria-hidden="true" />
                <span className="sr-only">Instagram</span>
              </a>
            )}
            {artist.website && (
              <a
                href={artist.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 hover:bg-red-600 rounded-md transition-colors"
                aria-label={`Site web de ${artist.name}`}
                onKeyPress={(e) => handleKeyPress(e, artist.website!)}
              >
                <Globe size={18} aria-hidden="true" />
                <span className="sr-only">Site web</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function ArtistsPage() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    loadArtists();

    const subscription = supabase
      .channel('artists_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artists' }, () => {
        loadArtists();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error loading artists:', error);
    }
  };

  const filters: FilterType[] = ['All', 'DJ', 'Live Act', 'VJ', 'Producer', 'DJ/Producer'];

  const filteredArtists = filter === 'All'
    ? artists
    : artists.filter(artist => artist.role === filter);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow">
            NOS ARTISTES
          </h1>
          <p className="text-gray-400 tracking-wide">
            La team RÜMBL // Sound. Light. Energy.
          </p>
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
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Aucun artiste trouvé pour ce filtre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
