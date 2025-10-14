import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Clock, Link2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Ambassador {
  id: string;
  name: string;
  ref_code: string;
  points: number;
  total_clicks: number;
  last_activity: string;
  is_active: boolean;
}

export default function AmbassadorLeaderboardPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false });

      if (error) throw error;
      setAmbassadors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ambassadors');
    } finally {
      setLoading(false);
    }
  };

  const copyRefLink = (refCode: string) => {
    const link = `${window.location.origin}?ref=${refCode}`;
    navigator.clipboard.writeText(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'url(/freepik__dark-black-background-dozens-of-heavy-metallic-cha__71706\\ \\(2\\)\\ copy\\ copy.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      <div className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy size={48} className="text-red-500" />
              <h1 className="text-5xl md:text-6xl font-black tracking-wider">
                CLASSEMENT AMBASSADEURS
              </h1>
            </div>
            <p className="text-xl text-gray-400 font-mono">
              RÜMBL CREW LEADERBOARD
            </p>
          </div>

          <div className="bg-black/70 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-red-600/10 border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-black tracking-wider text-red-500">
                      RANG
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black tracking-wider text-red-500">
                      NOM
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-black tracking-wider text-red-500">
                      POINTS
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-black tracking-wider text-red-500">
                      CLICS
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-black tracking-wider text-red-500">
                      DERNIÈRE ACTIVITÉ
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-black tracking-wider text-red-500">
                      LIEN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ambassadors.map((ambassador, index) => (
                    <tr
                      key={ambassador.id}
                      className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-2xl font-black ${
                              index === 0
                                ? 'text-yellow-400'
                                : index === 1
                                ? 'text-gray-300'
                                : index === 2
                                ? 'text-orange-400'
                                : 'text-gray-500'
                            }`}
                          >
                            #{index + 1}
                          </span>
                          {index < 3 && (
                            <Trophy
                              size={20}
                              className={
                                index === 0
                                  ? 'text-yellow-400'
                                  : index === 1
                                  ? 'text-gray-300'
                                  : 'text-orange-400'
                              }
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold">{ambassador.name}</span>
                        <div className="text-xs text-gray-500 font-mono">
                          @{ambassador.ref_code}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600 px-4 py-2 rounded-full">
                          <TrendingUp size={16} className="text-red-500" />
                          <span className="text-xl font-black text-white">
                            {ambassador.points}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg text-gray-300">
                          {ambassador.total_clicks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                          <Clock size={16} />
                          <span className="font-mono text-sm">
                            {formatDate(ambassador.last_activity)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => copyRefLink(ambassador.ref_code)}
                          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-all group"
                          title="Copier le lien de parrainage"
                        >
                          <Link2 size={16} className="text-white group-hover:text-red-500" />
                          <span className="text-sm font-mono">Copier</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {ambassadors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">Aucun ambassadeur actif pour le moment</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <div className="inline-block bg-black/70 backdrop-blur-sm border border-gray-800 rounded-2xl px-8 py-6">
              <p className="text-gray-400 mb-2 font-mono text-sm">
                TOTAL POINTS DE LA TEAM
              </p>
              <p className="text-5xl font-black text-red-500">
                {ambassadors.reduce((sum, amb) => sum + amb.points, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
