import { useState, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  status: string;
}

interface Submission {
  id: string;
  quest_id: string;
  ambassador_id: string;
  proof_urls: string[];
  status: string;
  submitted_at: string;
  ambassador?: {
    name: string;
    email: string;
  };
  quest?: {
    title: string;
    points: number;
  };
}

export default function AdminQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    points: 0,
    icon: '🎯'
  });

  useEffect(() => {
    fetchQuests();
    fetchSubmissions();
  }, []);

  const fetchQuests = async () => {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quests:', error);
    } else if (data) {
      setQuests(data);
    }
  };

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('quest_submissions')
      .select(`
        *,
        ambassador:ambassadors(name, email),
        quest:quests(title, points)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
    } else if (data) {
      setSubmissions(data as Submission[]);
    }
  };

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in');
      return;
    }

    const { error } = await supabase
      .from('quests')
      .insert({
        ...newQuest,
        created_by: user.id
      });

    if (error) {
      console.error('Error creating quest:', error);
      alert('Error creating quest');
    } else {
      setShowCreateForm(false);
      setNewQuest({ title: '', description: '', points: 0, icon: '🎯' });
      fetchQuests();
    }
  };

  const toggleQuestStatus = async (quest: Quest) => {
    const newStatus = quest.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('quests')
      .update({ status: newStatus })
      .eq('id', quest.id);

    if (error) {
      console.error('Error updating quest:', error);
    } else {
      fetchQuests();
    }
  };

  const handleReviewSubmission = async (submissionId: string, status: 'approved' | 'rejected', notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('quest_submissions')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Error reviewing submission:', error);
      alert('Error reviewing submission');
    } else {
      fetchSubmissions();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Gestion des Quests</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-bold flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Nouvelle Quest
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Quests</h2>
            <div className="space-y-4">
              {quests.map((quest) => (
                <div key={quest.id} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{quest.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold">{quest.title}</h3>
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                          {quest.points}P
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleQuestStatus(quest)}
                      className={`px-4 py-2 rounded text-sm font-bold ${
                        quest.status === 'active'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {quest.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <p className="text-gray-400">{quest.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Soumissions en attente ({submissions.length})</h2>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-gray-900 border border-yellow-600 rounded-lg p-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold">{submission.quest?.title}</h3>
                    <p className="text-sm text-gray-400">
                      Par: {submission.ambassador?.name} ({submission.ambassador?.email})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(submission.submitted_at).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  {submission.proof_urls.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-bold mb-2">Preuves:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {submission.proof_urls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm truncate"
                          >
                            Screenshot {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewSubmission(submission.id, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold flex items-center justify-center"
                    >
                      <Check size={16} className="mr-2" />
                      Approuver
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Raison du rejet (optionnel):');
                        handleReviewSubmission(submission.id, 'rejected', notes || undefined);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center justify-center"
                    >
                      <X size={16} className="mr-2" />
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-3xl font-bold mb-6">Nouvelle Quest</h2>
              <form onSubmit={handleCreateQuest} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">TITRE</label>
                  <input
                    type="text"
                    value={newQuest.title}
                    onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                    required
                    className="w-full bg-black border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">DESCRIPTION</label>
                  <textarea
                    value={newQuest.description}
                    onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full bg-black border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">POINTS</label>
                  <input
                    type="number"
                    value={newQuest.points}
                    onChange={(e) => setNewQuest({ ...newQuest, points: parseInt(e.target.value) })}
                    required
                    min="0"
                    className="w-full bg-black border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">ICÔNE (EMOJI)</label>
                  <input
                    type="text"
                    value={newQuest.icon}
                    onChange={(e) => setNewQuest({ ...newQuest, icon: e.target.value })}
                    required
                    className="w-full bg-black border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md"
                  >
                    Créer
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
