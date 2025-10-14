import { useState, useEffect } from 'react';
import { Target, TrendingUp, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  status: string;
}

interface QuestSubmission {
  id: string;
  quest_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  review_notes?: string;
  quest?: Quest;
}

export default function AmbassadorQuestsPage() {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<QuestSubmission[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/ambassadeurs/login');
      return;
    }

    const { data: ambassador } = await supabase
      .from('ambassadors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!ambassador) {
      navigate('/ambassadeurs/login');
      return;
    }

    setAmbassadorId(ambassador.id);
    fetchQuests();
    fetchSubmissions(ambassador.id);
  };

  const fetchQuests = async () => {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quests:', error);
    } else if (data) {
      setQuests(data);
    }
    setLoading(false);
  };

  const fetchSubmissions = async (ambId: string) => {
    const { data, error } = await supabase
      .from('quest_submissions')
      .select(`
        *,
        quest:quests(*)
      `)
      .eq('ambassador_id', ambId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
    } else if (data) {
      setSubmissions(data as QuestSubmission[]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProofFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuest || !ambassadorId || proofFiles.length === 0) return;

    setIsSubmitting(true);

    try {
      const proofUrls: string[] = [];

      for (const file of proofFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${ambassadorId}/${selectedQuest.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('quest-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('quest-proofs')
          .getPublicUrl(fileName);

        proofUrls.push(publicUrl);
      }

      const { error: submitError } = await supabase
        .from('quest_submissions')
        .insert({
          quest_id: selectedQuest.id,
          ambassador_id: ambassadorId,
          proof_urls: proofUrls,
          status: 'pending'
        });

      if (submitError) throw submitError;

      alert('Mission soumise avec succès ! En attente de validation.');
      setSelectedQuest(null);
      setProofFiles([]);
      fetchSubmissions(ambassadorId);
    } catch (error) {
      console.error('Error submitting quest:', error);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Rejetée';
      default:
        return 'En attente';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow">
            QUESTS
          </h1>
          <p className="text-gray-400 tracking-wide">
            Complète des missions pour gagner des points et débloquer des récompenses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Target className="mr-3 text-red-500" />
              Missions Disponibles
            </h2>
            <div className="space-y-4">
              {quests.map((quest) => {
                const hasSubmitted = submissions.some(s => s.quest_id === quest.id);
                return (
                  <div
                    key={quest.id}
                    className={`bg-black/70 backdrop-blur-sm border-2 rounded-lg p-6 transition-all cursor-pointer ${
                      hasSubmitted
                        ? 'border-gray-700 opacity-60'
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                    onClick={() => !hasSubmitted && setSelectedQuest(quest)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{quest.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{quest.title}</h3>
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {quest.points}P
                          </span>
                        </div>
                      </div>
                      {hasSubmitted && (
                        <span className="text-xs bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full">
                          Soumise
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300">{quest.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <TrendingUp className="mr-3 text-red-500" />
              Mes Soumissions
            </h2>
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="bg-black/70 backdrop-blur-sm border-2 border-gray-700 rounded-lg p-8 text-center">
                  <p className="text-gray-400">Aucune soumission pour le moment</p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-black/70 backdrop-blur-sm border-2 border-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {submission.quest?.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(submission.status)}
                          <span className="text-sm text-gray-400">
                            {getStatusText(submission.status)}
                          </span>
                        </div>
                      </div>
                      {submission.quest && (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {submission.quest.points}P
                        </span>
                      )}
                    </div>
                    {submission.review_notes && (
                      <div className="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                        <p className="text-sm text-gray-400">
                          <span className="font-bold text-white">Note:</span> {submission.review_notes}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      Soumis le {new Date(submission.submitted_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {selectedQuest && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-3xl font-bold mb-4">{selectedQuest.title}</h2>
              <p className="text-gray-300 mb-6">{selectedQuest.description}</p>
              <div className="mb-6">
                <span className="bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold">
                  {selectedQuest.points} Points
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-bold tracking-wider mb-2">
                    PREUVE (SCREENSHOTS) *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      required
                      className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <Upload className="absolute right-4 top-3 text-gray-500 pointer-events-none" size={20} />
                  </div>
                  {proofFiles.length > 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      {proofFiles.length} fichier(s) sélectionné(s)
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuest(null);
                      setProofFiles([]);
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-md transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || proofFiles.length === 0}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-md transition-all disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Envoi...' : 'Soumettre'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
