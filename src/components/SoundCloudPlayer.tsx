import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music2 } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist_name: string;
  soundcloud_embed_url: string;
  artwork_url?: string;
  duration?: number;
}

interface SoundCloudPlayerProps {
  tracks: Track[];
  autoPlay?: boolean;
}

export default function SoundCloudPlayer({ tracks, autoPlay = false }: SoundCloudPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (!iframeRef.current) return;

    const loadWidget = () => {
      const SC = (window as any).SC;
      if (!SC || !SC.Widget) {
        setTimeout(loadWidget, 100);
        return;
      }

      widgetRef.current = SC.Widget(iframeRef.current);

      widgetRef.current.bind(SC.Widget.Events.READY, () => {
        widgetRef.current.setVolume(isMuted ? 0 : volume * 100);

        if (autoPlay) {
          widgetRef.current.play();
          setIsPlaying(true);
        }
      });

      widgetRef.current.bind(SC.Widget.Events.PLAY, () => {
        setIsPlaying(true);
      });

      widgetRef.current.bind(SC.Widget.Events.PAUSE, () => {
        setIsPlaying(false);
      });

      widgetRef.current.bind(SC.Widget.Events.FINISH, () => {
        handleNext();
      });
    };

    if (!(window as any).SC) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = loadWidget;
      document.body.appendChild(script);
    } else {
      loadWidget();
    }
  }, []);

  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.setVolume(isMuted ? 0 : volume * 100);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (widgetRef.current && currentTrack) {
      widgetRef.current.load(currentTrack.soundcloud_embed_url, {
        auto_play: isPlaying,
      });
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!widgetRef.current) return;

    if (isPlaying) {
      widgetRef.current.pause();
    } else {
      widgetRef.current.play();
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(tracks.length - 1);
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

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-900 rounded-lg">
        <p className="text-gray-400">Aucun son disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-red-900/20 to-black flex items-center justify-center">
        {currentTrack.artwork_url ? (
          <img
            src={currentTrack.artwork_url}
            alt={currentTrack.title}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <Music2 size={64} className="text-red-600 opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <iframe
        ref={iframeRef}
        width="100%"
        height="0"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(currentTrack.soundcloud_embed_url)}&color=%23dc2626&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
        style={{ display: 'none' }}
      />

      <div className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1 truncate">
            {currentTrack.title}
          </h3>
          <p className="text-sm text-gray-400">{currentTrack.artist_name}</p>
          <p className="text-xs text-gray-500 mt-2">
            {currentTrackIndex + 1} / {tracks.length}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevious}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Précédent"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full transition-all shadow-lg"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleNext}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Suivant"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
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
              background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
            }}
            aria-label="Volume"
          />
          <span className="text-xs text-gray-400 w-10 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {tracks.length > 1 && (
          <div className="max-h-48 overflow-y-auto space-y-2 pt-4 border-t border-gray-800">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => setCurrentTrackIndex(index)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  index === currentTrackIndex
                    ? 'bg-red-600/20 border border-red-600/50'
                    : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                    {index === currentTrackIndex && isPlaying ? (
                      <Music2 size={16} className="text-red-500 animate-pulse" />
                    ) : (
                      <span className="text-xs text-gray-400">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{track.title}</p>
                    <p className="text-xs text-gray-400 truncate">{track.artist_name}</p>
                  </div>
                </div>
              </button>
            ))}
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
  );
}
