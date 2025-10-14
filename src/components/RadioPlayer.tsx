import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Music, ChevronDown, ChevronUp, Disc3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SoundCloudPlayer from './SoundCloudPlayer';

interface RadioPlayerProps {
  streamUrl?: string;
}

interface Track {
  id: string;
  title: string;
  artist_name: string;
  soundcloud_embed_url: string;
  artwork_url?: string;
  duration?: number;
}

const hardTechnoStations = [
  { name: 'HardBase.FM', url: 'https://mp3.stream.tb-group.fm/hb.mp3', genre: 'Hardcore & Hardstyle' },
  { name: 'TechnoBase.FM', url: 'https://mp3.stream.tb-group.fm/tb.mp3', genre: 'Hard Techno' },
  { name: 'HardGroove', url: 'https://stream.laut.fm/hardgroove', genre: 'Hard Groove Techno' },
  { name: 'CoreTime.FM', url: 'https://mp3.stream.tb-group.fm/ct.mp3', genre: 'Hardcore' },
  { name: 'Techno Live', url: 'https://stream.laut.fm/techno_live', genre: 'Techno Live Sets' },
  { name: 'Minimal Deep', url: 'https://stream.laut.fm/minimal-techno', genre: 'Minimal Techno' }
];

export default function RadioPlayer({ streamUrl }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const [mode, setMode] = useState<'radio' | 'soundcloud'>('radio');
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeStream = streamUrl || hardTechnoStations[currentStation].url;

  useEffect(() => {
    fetchArtistTracks();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && isPlaying && mode === 'radio') {
      audioRef.current.load();
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
  }, [currentStation]);

  const fetchArtistTracks = async () => {
    setLoading(true);
    try {
      const { data: tracks, error: tracksError } = await supabase
        .from('artist_tracks')
        .select(`
          id,
          title,
          soundcloud_embed_url,
          artwork_url,
          duration,
          artist:artists(name)
        `)
        .eq('is_featured', true)
        .order('order_index');

      if (tracksError) throw tracksError;

      const formattedTracks = tracks?.map(track => ({
        id: track.id,
        title: track.title,
        artist_name: (track.artist as any)?.name || 'Unknown Artist',
        soundcloud_embed_url: track.soundcloud_embed_url,
        artwork_url: track.artwork_url,
        duration: track.duration
      })) || [];

      setArtistTracks(formattedTracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          alert('Erreur lors de la lecture de la radio');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const switchMode = (newMode: 'radio' | 'soundcloud') => {
    if (mode === 'radio' && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setMode(newMode);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 border-2 border-red-400"
        >
          <Radio className={isPlaying ? 'animate-pulse' : ''} size={24} />
        </button>
      </div>
    );
  }

  return (
    <>
      {mode === 'radio' && <audio ref={audioRef} src={activeStream} />}

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900 to-transparent backdrop-blur-xl border-t border-red-500/30 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">

          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={() => switchMode('radio')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                mode === 'radio'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Radio size={14} />
              Stations Radio
            </button>
            <button
              onClick={() => switchMode('soundcloud')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                mode === 'soundcloud'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Disc3 size={14} />
              Sons RÜMBL
            </button>
          </div>

          {mode === 'radio' ? (
            <>
              <div className="flex items-center justify-between gap-2 sm:gap-4 mb-1">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                      <Music className="text-white" size={16} />
                    </div>
                    {isPlaying && (
                      <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm tracking-wider flex items-center gap-1 sm:gap-2">
                      <Radio size={14} className="text-red-500 flex-shrink-0" />
                      <span className="truncate">RÜMBL RADIO</span>
                    </h3>
                    <p className="text-gray-400 text-xs truncate">
                      {isPlaying ? `🔴 ${hardTechnoStations[currentStation].name}` : 'Appuyez sur play'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <button
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white transition-colors hidden sm:block"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>

                  <button
                    onClick={togglePlay}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-2 sm:p-3 rounded-full transition-all shadow-lg flex-shrink-0"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 hover:text-white transition-colors sm:hidden"
                  >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </button>

                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm font-bold hidden sm:block"
                  >
                    RÉDUIRE
                  </button>
                </div>
              </div>

              <div className={`space-y-2 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'} sm:block`}>
                {!streamUrl && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {hardTechnoStations.map((station, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentStation(index)}
                        className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all truncate ${
                          currentStation === index
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                        title={`${station.name} - ${station.genre}`}
                      >
                        {station.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white transition-colors sm:hidden"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                    }}
                  />
                  <span className="text-xs text-gray-400 w-10 text-right">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                </div>

                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-full text-gray-400 hover:text-white transition-colors text-xs font-bold py-2 sm:hidden"
                >
                  RÉDUIRE
                </button>
              </div>
            </>
          ) : (
            <div className="pb-2">
              {loading ? (
                <div className="flex items-center justify-center p-8 text-gray-400">
                  Chargement...
                </div>
              ) : artistTracks.length > 0 ? (
                <SoundCloudPlayer tracks={artistTracks} autoPlay={false} />
              ) : (
                <div className="flex items-center justify-center p-8 text-gray-400">
                  Aucun son disponible. Les artistes peuvent ajouter leurs sons via Shotgun.
                </div>
              )}
              <button
                onClick={() => setIsMinimized(true)}
                className="w-full text-gray-400 hover:text-white transition-colors text-xs font-bold py-2 mt-3"
              >
                RÉDUIRE
              </button>
            </div>
          )}
        </div>

        <style>{`
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          }
          .slider-thumb::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          }
        `}</style>
      </div>
    </>
  );
}
