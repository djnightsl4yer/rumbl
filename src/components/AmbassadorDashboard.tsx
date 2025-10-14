import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Star, Gift, Award, ChevronRight } from 'lucide-react';

interface AmbassadorStats {
  totalPoints: number;
  level: string;
  nextLevel: string;
  pointsToNextLevel: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  points: number;
  date: string;
}

export default function AmbassadorDashboard() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stats] = useState<AmbassadorStats>({
    totalPoints: 175,
    level: 'Silver',
    nextLevel: 'Gold',
    pointsToNextLevel: 76,
    recentActivities: [
      { id: '1', type: 'event_promotion', description: 'Promotion event sur Instagram', points: 20, date: '2025-10-08' },
      { id: '2', type: 'ticket_sale', description: '5 tickets vendus via ton lien', points: 50, date: '2025-10-07' },
      { id: '3', type: 'social_share', description: 'Story partagée sur TikTok', points: 15, date: '2025-10-06' },
      { id: '4', type: 'referral', description: 'Nouveau ambassadeur parrainé', points: 40, date: '2025-10-05' },
      { id: '5', type: 'event_promotion', description: 'Post Facebook événement', points: 20, date: '2025-10-04' },
    ],
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const levelColors = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#E5E4E2',
  };

  const levelBenefits = {
    Bronze: ['Accès prioritaire aux événements', 'Badge Bronze exclusif', 'Newsletter dédiée'],
    Silver: ['Tous les avantages Bronze', '1 entrée gratuite par mois', 'Réduction 20% merchandising', 'Accès backstage'],
    Gold: ['Tous les avantages Silver', '2 entrées gratuites par mois', 'Meet & Greet artistes', 'Nom sur le site'],
    Platinum: ['Tous les avantages Gold', 'Invitations VIP illimitées', 'Participation choix artistes', 'Événement privé annuel'],
  };

  const progress = (stats.totalPoints / (stats.totalPoints + stats.pointsToNextLevel)) * 100;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow metal-font">
            DASHBOARD AMBASSADEUR
          </h1>
          <p className="text-gray-400 tracking-wide text-lg">
            Suis ta progression et gagne des récompenses exclusives
          </p>
        </div>

        <div
          className="mb-12 relative"
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
            transition: 'transform 0.2s ease-out',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="bg-gradient-to-br from-black via-gray-900 to-black border-2 rounded-2xl p-8 md:p-12 shadow-2xl"
            style={{
              borderColor: levelColors[stats.level as keyof typeof levelColors],
              boxShadow: `0 0 40px ${levelColors[stats.level as keyof typeof levelColors]}40`,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <Award
                    size={48}
                    style={{ color: levelColors[stats.level as keyof typeof levelColors] }}
                  />
                </div>
                <h2 className="text-4xl font-bold mb-2" style={{ color: levelColors[stats.level as keyof typeof levelColors] }}>
                  {stats.level}
                </h2>
                <p className="text-gray-400 text-sm">Niveau actuel</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Trophy size={48} className="text-yellow-500" />
                </div>
                <h2 className="text-4xl font-bold mb-2 text-white">
                  {stats.totalPoints}
                </h2>
                <p className="text-gray-400 text-sm">Points totaux</p>
              </div>

              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end mb-4">
                  <TrendingUp size={48} className="text-green-500" />
                </div>
                <h2 className="text-4xl font-bold mb-2 text-white">
                  {stats.pointsToNextLevel}
                </h2>
                <p className="text-gray-400 text-sm">Points pour {stats.nextLevel}</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progression vers {stats.nextLevel}</span>
                <span className="font-bold text-white">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${levelColors[stats.level as keyof typeof levelColors]}, ${levelColors[stats.nextLevel as keyof typeof levelColors]})`,
                    boxShadow: `0 0 20px ${levelColors[stats.nextLevel as keyof typeof levelColors]}80`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div
            className="bg-black border border-gray-800 rounded-xl p-6"
            style={{
              transform: `perspective(800px) rotateY(${mousePosition.x * -3}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            <h3 className="text-2xl font-bold tracking-wider mb-6 flex items-center">
              <Star className="mr-3 text-yellow-500" />
              ACTIVITÉS RÉCENTES
            </h3>
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-red-500 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-white font-medium">{activity.description}</p>
                    <span className="text-green-500 font-bold text-lg">+{activity.points}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{new Date(activity.date).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-black border border-gray-800 rounded-xl p-6"
            style={{
              transform: `perspective(800px) rotateY(${mousePosition.x * 3}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            <h3 className="text-2xl font-bold tracking-wider mb-6 flex items-center">
              <Gift className="mr-3 text-red-500" />
              TES AVANTAGES {stats.level.toUpperCase()}
            </h3>
            <div className="space-y-3">
              {levelBenefits[stats.level as keyof typeof levelBenefits].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-900/50 border border-gray-800 rounded-lg p-3 hover:border-red-500 transition-all duration-300"
                >
                  <ChevronRight className="text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-lg font-bold mb-3 text-yellow-500">
                Prochains avantages ({stats.nextLevel})
              </h4>
              <div className="space-y-2 opacity-60">
                {levelBenefits[stats.nextLevel as keyof typeof levelBenefits].slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <ChevronRight className="text-yellow-500 mr-2 flex-shrink-0" size={16} />
                    <span className="text-gray-400">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-950/50 to-black border border-red-500/30 rounded-xl p-8">
          <h3 className="text-2xl font-bold tracking-wider mb-4 text-center">
            COMMENT GAGNER DES POINTS ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-black/50 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">+10</div>
              <p className="text-sm text-gray-300">Story Instagram/TikTok</p>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">+20</div>
              <p className="text-sm text-gray-300">Post événement</p>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">+10/ticket</div>
              <p className="text-sm text-gray-300">Vente de tickets</p>
            </div>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">+40</div>
              <p className="text-sm text-gray-300">Parrainage ambassadeur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
