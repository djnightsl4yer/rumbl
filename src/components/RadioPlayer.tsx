import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Music } from 'lucide-react';

interface RadioPlayerProps {
  streamUrl?: string;
}

const hardTechnoStations = [
  { name: 'HardBase.FM', url: 'https://mp3.stream.tb-group.fm/hb.mp3', genre: 'Hardcore & Hardstyle' },
  { name: 'TechnoBase.FM', url: 'https://mp3.stream.tb-group.fm/tb.mp3', genre: 'Hard Techno' },
  { name: 'ClubSounds.FM', url: 'https://mp3.stream.tb-group.fm/csa.mp3', genre: 'Techno Club' },
  { name: 'CoreTime.FM', url: 'https://mp3.stream.tb-group.fm/ct.mp3', genre: 'Hardcore' }
];

export default function RadioPlayer({ streamUrl }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStation, setCurrentStation] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeStream = streamUrl || hardTechnoStations[currentStation].url;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
  }, [currentStation]);

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
      <audio ref={audioRef} src={activeStream} />

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900 to-transparent backdrop-blur-xl border-t border-red-500/30 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                  <Music className="text-white" size={24} />
                </div>
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-white font-bold text-lg tracking-wider flex items-center gap-2">
                  <Radio size={20} className="text-red-500" />
                  RÜMBL RADIO
                </h3>
                <p className="text-gray-400 text-sm">
                  {isPlaying ? `🔴 ${hardTechnoStations[currentStation].name} - ${hardTechnoStations[currentStation].genre}` : 'Appuyez sur play pour écouter'}
                </p>
              </div>

              {!streamUrl && (
                <div className="flex gap-2">
                  {hardTechnoStations.map((station, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStation(index)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        currentStation === index
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {station.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition-colors"
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
                  className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                  }}
                />
              </div>

              <button
                onClick={togglePlay}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-full transition-all transform hover:scale-110 shadow-lg"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-white transition-colors text-sm font-bold"
              >
                RÉDUIRE
              </button>
            </div>
          </div>
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
