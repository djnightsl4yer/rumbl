import { useState } from 'react';
import { Users, Send, CheckCircle, Megaphone, Target, Award, Gift, TrendingUp, Star } from 'lucide-react';

type View = 'landing' | 'dashboard';
type Tab = 'points' | 'quests' | 'rewards';

interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  status: 'open' | 'done';
  icon: string;
  participants: number;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  status: 'available' | 'claimed';
  progress?: { current: number; total: number };
}

interface MissionFormData {
  firstName: string;
  lastName: string;
  email: string;
  instagram: string;
  motivation: string;
  experience: string;
  availability: string;
}

export default function AmbassadeursPage() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentTab, setCurrentTab] = useState<Tab>('points');
  const [userPoints, setUserPoints] = useState(500);
  const [formData, setFormData] = useState<MissionFormData>({
    firstName: '',
    lastName: '',
    email: '',
    instagram: '',
    motivation: '',
    experience: '',
    availability: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quests: Quest[] = [
    {
      id: '1',
      title: 'Locker',
      description: 'Partage une story Instagram avec ton locker backstage',
      points: 75,
      status: 'open',
      icon: '📢',
      participants: 140,
    },
    {
      id: '2',
      title: 'Make your own TikTok Video',
      description: 'Crée une vidéo TikTok pour promouvoir RÜMBL',
      points: 300,
      status: 'open',
      icon: '🎥',
      participants: 19,
    },
    {
      id: '3',
      title: 'Bring Friends to Event',
      description: 'Amène 3 amis à un événement RÜMBL',
      points: 150,
      status: 'open',
      icon: '🎉',
      participants: 85,
    },
    {
      id: '4',
      title: 'Instagram Story Campaign',
      description: 'Poste 5 stories par semaine pendant un mois',
      points: 400,
      status: 'done',
      icon: '📱',
      participants: 62,
    },
  ];

  const rewards: Reward[] = [
    {
      id: '1',
      title: 'GUESTLIST @RÜMBL XXL',
      description: 'Accès guestlist pour toi + 1 à notre prochain RÜMBL XXL',
      points: 1250,
      status: 'available',
      progress: { current: 500, total: 1250 },
    },
    {
      id: '2',
      title: '25€ DRINK TOKENS',
      description: '25€ en tokens boissons valables sur tous nos événements',
      points: 800,
      status: 'available',
    },
    {
      id: '3',
      title: 'BACKSTAGE PASS',
      description: 'Accès backstage + meet & greet avec les artistes',
      points: 2000,
      status: 'available',
    },
    {
      id: '4',
      title: 'EXCLUSIVE MERCH',
      description: 'Pack merch exclusif ambassadeur (t-shirt + casquette)',
      points: 600,
      status: 'available',
    },
  ];

  const stats = [
    { label: 'Points', value: userPoints, icon: Star },
    { label: 'Products sold', value: 0, icon: Gift },
    { label: 'Tasks done', value: 6, icon: CheckCircle },
    { label: 'Rewards', value: 0, icon: Award },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/submit-ambassador-application`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      console.log('Application submitted successfully:', result);

      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          instagram: '',
          motivation: '',
          experience: '',
          availability: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Une erreur est survenue lors de l\'envoi de votre candidature. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen relative z-10">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/freepik__dark-black-background-dozens-of-heavy-metallic-cha__71706\\ \\(2\\)\\ copy\\ copy.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        <div className="relative z-20 pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-black/70 backdrop-blur-sm px-8 py-8 rounded-2xl mb-6">
                <h1 className="text-4xl md:text-5xl font-black tracking-wider text-white mb-2">
                  RÜMBL
                </h1>
                <p className="text-gray-300 text-lg font-medium">Ambassador Dashboard</p>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setCurrentTab('points')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold tracking-wider transition-all ${
                  currentTab === 'points'
                    ? 'bg-red-600 text-white'
                    : 'bg-black/70 text-white hover:bg-black/90'
                }`}
              >
                <Star size={20} />
                Points
              </button>
              <button
                onClick={() => setCurrentTab('quests')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold tracking-wider transition-all ${
                  currentTab === 'quests'
                    ? 'bg-red-600 text-white'
                    : 'bg-black/70 text-white hover:bg-black/90'
                }`}
              >
                <Target size={20} />
                Quests
              </button>
              <button
                onClick={() => setCurrentTab('rewards')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold tracking-wider transition-all ${
                  currentTab === 'rewards'
                    ? 'bg-red-600 text-white'
                    : 'bg-black/70 text-white hover:bg-black/90'
                }`}
              >
                <Gift size={20} />
                Rewards
              </button>
            </div>

            {currentTab === 'points' && (
              <div className="space-y-6">
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700">
                  <div className="w-24 h-24 mx-auto mb-6 bg-red-600/20 rounded-full flex items-center justify-center border-2 border-red-600">
                    <Users size={48} className="text-red-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    You have {userPoints} points
                  </h3>
                  <p className="text-gray-300 text-lg mb-4">
                    Just {1250 - userPoints} more points for
                  </p>
                  <p className="text-xl font-bold text-white">GUESTLIST @RÜMBL XXL</p>

                  <div className="mt-6 relative">
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 transition-all duration-500"
                        style={{ width: `${(userPoints / 1250) * 100}%` }}
                      />
                    </div>
                    <div className="absolute -right-2 -top-2">
                      <div className="w-12 h-12 bg-black rounded-full border-4 border-red-600 flex items-center justify-center">
                        <Gift size={20} className="text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h4 className="text-xl font-bold text-white mb-4">Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                      >
                        <stat.icon size={32} className="text-red-500 mb-2" />
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                        <div className="text-gray-400 text-sm">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('landing')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Retour
                </button>
              </div>
            )}

            {currentTab === 'quests' && (
              <div className="space-y-6">
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700">
                  <h3 className="text-3xl font-bold text-white mb-3">Quests</h3>
                  <p className="text-gray-300 text-lg">
                    Bring your friends, light up your socials, take on exclusive challenges, and show the world how you party.
                  </p>
                </div>

                <div className="space-y-4">
                  {quests.map((quest) => (
                    <div
                      key={quest.id}
                      className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-black/80 transition-all cursor-pointer border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{quest.icon}</div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {quest.points}P
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  quest.status === 'open'
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600'
                                    : 'bg-green-600/20 text-green-400 border border-green-600'
                                }`}
                              >
                                {quest.status === 'open' ? 'Open' : 'Done'}
                              </span>
                            </div>
                            <h4 className="text-xl font-bold text-white">{quest.title}</h4>
                          </div>
                        </div>
                        <TrendingUp size={24} className="text-gray-500" />
                      </div>
                      <p className="text-gray-300 mb-3">{quest.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-red-600/30 border-2 border-gray-700 flex items-center justify-center text-xs font-bold text-white"
                            >
                              {String.fromCharCode(65 + i - 1)}
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-700 flex items-center justify-center text-xs font-bold text-white">
                            +{quest.participants - 5}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentView('landing')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Retour
                </button>
              </div>
            )}

            {currentTab === 'rewards' && (
              <div className="space-y-6">
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700">
                  <h3 className="text-3xl font-bold text-white mb-3">Rewards</h3>
                  <p className="text-gray-300 text-lg">
                    All these could be yours! You have {userPoints} points right now.
                  </p>
                </div>

                <div className="grid gap-4">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-black/80 transition-all border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                              {reward.points} / {reward.points} Points
                            </span>
                          </div>
                          <h4 className="text-2xl font-black text-white mb-2 tracking-wide">
                            {reward.title}
                          </h4>
                          <p className="text-gray-300">{reward.description}</p>
                        </div>
                        <TrendingUp size={24} className="text-gray-500" />
                      </div>
                      {reward.progress && (
                        <div className="relative mt-4">
                          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-600 transition-all duration-500"
                              style={{
                                width: `${(reward.progress.current / reward.progress.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-red-600">
                    <div className="w-12 h-12 bg-red-600 rounded-full" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    No Rewards Yet, But Stay Tuned!
                  </h4>
                  <p className="text-gray-300">No Rewards Pending Yet!</p>
                </div>

                <button
                  onClick={() => setCurrentView('landing')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Retour
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow metal-font">
            AMBASSADEURS RP
          </h1>
          <p className="text-gray-400 tracking-wide max-w-3xl mx-auto text-lg">
            Rejoins la team RÜMBL en tant qu'ambassadeur et aide-nous à faire vibrer la scène techno underground parisienne
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold tracking-wider px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
          >
            <TrendingUp className="mr-3" size={24} />
            VOIR TON DASHBOARD
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-black border border-red-500/30 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <Megaphone className="w-12 h-12 text-red-500 mb-4 mx-auto" />
            <h3 className="text-xl font-bold tracking-wider mb-3 text-center">PROMO EVENTS</h3>
            <p className="text-gray-400 text-sm text-center">
              Fais connaître nos événements sur tes réseaux et dans ton cercle
            </p>
          </div>

          <div className="bg-black border border-red-500/30 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <Target className="w-12 h-12 text-red-500 mb-4 mx-auto" />
            <h3 className="text-xl font-bold tracking-wider mb-3 text-center">MISSIONS</h3>
            <p className="text-gray-400 text-sm text-center">
              Reçois des missions régulières pour promouvoir RÜMBL
            </p>
          </div>

          <div className="bg-black border border-red-500/30 rounded-lg p-6 hover:border-red-500 transition-all duration-300">
            <Award className="w-12 h-12 text-red-500 mb-4 mx-auto" />
            <h3 className="text-xl font-bold tracking-wider mb-3 text-center">AVANTAGES</h3>
            <p className="text-gray-400 text-sm text-center">
              Accès privilégié aux événements et goodies exclusifs
            </p>
          </div>
        </div>

        <div className="bg-black border border-gray-800 rounded-lg p-8 md:p-12">
          {isSubmitted ? (
            <div className="text-center py-12">
              <CheckCircle size={64} className="mx-auto mb-6 text-green-500" />
              <h2 className="text-3xl font-bold mb-4 tracking-wider metal-font">CANDIDATURE ENVOYÉE</h2>
              <p className="text-gray-400">
                Merci pour ta candidature ! On te contactera très vite pour discuter de ton rôle d'ambassadeur.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold tracking-wider mb-6 text-center metal-font">
                DEVIENS AMBASSADEUR
              </h2>
              <p className="text-gray-400 text-center mb-8">
                Remplis ce formulaire pour rejoindre la team RP de RÜMBL
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-bold tracking-wider mb-2">
                      PRÉNOM *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="Ton prénom"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-bold tracking-wider mb-2">
                      NOM *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="Ton nom"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold tracking-wider mb-2">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="ton.email@exemple.com"
                  />
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-sm font-bold tracking-wider mb-2">
                    INSTAGRAM *
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="@ton_pseudo"
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-bold tracking-wider mb-2">
                    EXPÉRIENCE RP / PROMO
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                    placeholder="As-tu déjà fait de la promo pour des événements ? (optionnel)"
                  />
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-bold tracking-wider mb-2">
                    DISPONIBILITÉ *
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="">Sélectionne ta disponibilité</option>
                    <option value="tres-disponible">Très disponible (plusieurs fois par semaine)</option>
                    <option value="disponible">Disponible (une fois par semaine)</option>
                    <option value="occasionnel">Occasionnel (quelques fois par mois)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="motivation" className="block text-sm font-bold tracking-wider mb-2">
                    POURQUOI REJOINDRE RÜMBL ? *
                  </label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                    placeholder="Explique-nous pourquoi tu veux devenir ambassadeur RÜMBL..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold tracking-wider py-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      ENVOI EN COURS...
                    </>
                  ) : (
                    <>
                      <Send size={20} className="mr-3" />
                      ENVOYER MA CANDIDATURE
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-12 bg-black/50 border border-gray-800 rounded-lg p-8">
          <h3 className="text-2xl font-bold tracking-wider mb-4 metal-font flex items-center justify-center">
            <Users className="mr-3 text-red-500" />
            QU'EST-CE QU'UN AMBASSADEUR RÜMBL ?
          </h3>
          <div className="space-y-4 text-gray-300">
            <p>
              Les ambassadeurs RÜMBL sont nos relais privilégiés pour faire connaître nos événements
              et développer notre communauté underground. En tant qu'ambassadeur, tu seras au cœur
              de l'action et tu contribueras activement à l'énergie de nos raves.
            </p>
            <p className="text-red-500 font-bold">
              En échange de ton engagement, tu bénéficieras d'invitations prioritaires, de goodies
              exclusifs, et d'une reconnaissance au sein de la communauté RÜMBL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
