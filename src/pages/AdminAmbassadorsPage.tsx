import { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, Edit2, Save, X, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Ambassador, AmbassadorSale } from '../types/ambassador';

interface AmbassadorWithStats extends Ambassador {
  recent_sales: AmbassadorSale[];
}

const ADMIN_PASSWORD = 'RUMBL_ADMIN_2025';

export default function AdminAmbassadorsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [ambassadors, setAmbassadors] = useState<AmbassadorWithStats[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Ambassador>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAmbassador, setNewAmbassador] = useState({
    name: '',
    ref_code: '',
    points: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('rumbl_admin_auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAmbassadors();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('rumbl_admin_auth', 'true');
      setPassword('');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rumbl_admin_auth');
  };

  const fetchAmbassadors = async () => {
    try {
      setLoading(true);
      const { data: ambassadorData, error: ambassadorError } = await supabase
        .from('ambassadors')
        .select('*')
        .order('points', { ascending: false });

      if (ambassadorError) throw ambassadorError;

      const ambassadorsWithStats = await Promise.all(
        (ambassadorData || []).map(async (ambassador) => {
          const { data: salesData } = await supabase
            .from('ambassador_sales')
            .select('*')
            .eq('ambassador_id', ambassador.id)
            .order('sale_date', { ascending: false })
            .limit(5);

          return {
            ...ambassador,
            recent_sales: salesData || [],
          };
        })
      );

      setAmbassadors(ambassadorsWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ambassadors');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newAmbassador.name || !newAmbassador.ref_code) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('ambassadors')
        .insert({
          name: newAmbassador.name,
          ref_code: newAmbassador.ref_code.toLowerCase(),
          points: newAmbassador.points || 0,
        });

      if (error) throw error;

      setNewAmbassador({ name: '', ref_code: '', points: 0 });
      setShowAddForm(false);
      fetchAmbassadors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add ambassador');
    }
  };

  const startEdit = (ambassador: Ambassador) => {
    setEditingId(ambassador.id);
    setEditForm(ambassador);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('ambassadors')
        .update({
          name: editForm.name,
          ref_code: editForm.ref_code,
          points: editForm.points,
          is_active: editForm.is_active,
        })
        .eq('id', editingId);

      if (error) throw error;

      setEditingId(null);
      setEditForm({});
      fetchAmbassadors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update ambassador');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ambassadeur ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ambassadors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAmbassadors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete ambassador');
    }
  };

  const handleResetPoints = async (id: string) => {
    if (!confirm('Réinitialiser les points à 0 ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ambassadors')
        .update({ points: 0, total_clicks: 0 })
        .eq('id', id);

      if (error) throw error;
      fetchAmbassadors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset points');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-black/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Shield size={48} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-3xl font-black text-white mb-2">
              ADMIN ACCESS
            </h1>
            <p className="text-gray-400 font-mono text-sm">RÜMBL AMBASSADOR MANAGEMENT</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 mb-4"
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'url(/freepik__dark-black-background-dozens-of-heavy-metallic-cha__71706\\ \\(2\\)\\ copy\\ copy.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      <div className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-wider mb-2">
                ADMIN PANEL
              </h1>
              <p className="text-gray-400 font-mono">Ambassador Management System</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-lg font-bold transition-all"
            >
              LOGOUT
            </button>
          </div>

          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold transition-all"
            >
              <Plus size={20} />
              NOUVEL AMBASSADEUR
            </button>
            <button
              onClick={fetchAmbassadors}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-lg font-bold transition-all"
            >
              <RefreshCw size={20} />
              REFRESH
            </button>
          </div>

          {showAddForm && (
            <div className="bg-black/70 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Ajouter un ambassadeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nom"
                  value={newAmbassador.name}
                  onChange={(e) => setNewAmbassador({ ...newAmbassador, name: e.target.value })}
                  className="bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  placeholder="Code ref (ex: sarah)"
                  value={newAmbassador.ref_code}
                  onChange={(e) => setNewAmbassador({ ...newAmbassador, ref_code: e.target.value.toLowerCase() })}
                  className="bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="number"
                  placeholder="Points initiaux"
                  value={newAmbassador.points}
                  onChange={(e) => setNewAmbassador({ ...newAmbassador, points: parseInt(e.target.value) || 0 })}
                  className="bg-white/5 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold transition-all"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-bold transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-2xl text-gray-400 animate-pulse">Loading...</div>
            </div>
          ) : error ? (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-500">
              {error}
            </div>
          ) : (
            <div className="bg-black/70 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-red-600/10 border-b border-gray-800">
                      <th className="px-4 py-3 text-left text-sm font-black">NOM</th>
                      <th className="px-4 py-3 text-left text-sm font-black">REF CODE</th>
                      <th className="px-4 py-3 text-center text-sm font-black">POINTS</th>
                      <th className="px-4 py-3 text-center text-sm font-black">CLICS</th>
                      <th className="px-4 py-3 text-center text-sm font-black">VENTES</th>
                      <th className="px-4 py-3 text-center text-sm font-black">COMMISSION</th>
                      <th className="px-4 py-3 text-center text-sm font-black">ACTIF</th>
                      <th className="px-4 py-3 text-center text-sm font-black">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ambassadors.map((ambassador) => (
                      <tr
                        key={ambassador.id}
                        className="border-b border-gray-800/50 hover:bg-white/5"
                      >
                        {editingId === ambassador.id ? (
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full bg-white/5 border border-gray-700 rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editForm.ref_code}
                                onChange={(e) => setEditForm({ ...editForm, ref_code: e.target.value })}
                                className="w-full bg-white/5 border border-gray-700 rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={editForm.points}
                                onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-gray-700 rounded px-2 py-1 text-sm text-center"
                              />
                            </td>
                            <td className="px-4 py-3 text-center text-gray-400">
                              {ambassador.total_clicks}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-400" colSpan={2}>
                              -
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={editForm.is_active}
                                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                className="w-5 h-5"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={handleUpdate}
                                  className="p-2 bg-green-600 hover:bg-green-700 rounded transition-all"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-2 bg-gray-600 hover:bg-gray-700 rounded transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-bold">{ambassador.name}</td>
                            <td className="px-4 py-3 font-mono text-sm text-gray-400">
                              {ambassador.ref_code}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-red-600/20 border border-red-600 px-3 py-1 rounded-full text-sm font-bold">
                                {ambassador.points}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-400">
                              {ambassador.total_clicks}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-green-500 font-bold">
                                {Number(ambassador.total_sales || 0).toFixed(2)}€
                              </span>
                              <div className="text-xs text-gray-500">
                                {ambassador.total_conversions || 0} conv.
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-purple-500 font-bold">
                                {Number(ambassador.commission_earned || 0).toFixed(2)}€
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block w-3 h-3 rounded-full ${
                                  ambassador.is_active ? 'bg-green-500' : 'bg-gray-500'
                                }`}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => startEdit(ambassador)}
                                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-all"
                                  title="Modifier"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleResetPoints(ambassador.id)}
                                  className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-all"
                                  title="Reset points"
                                >
                                  <RefreshCw size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(ambassador.id)}
                                  className="p-2 bg-red-600 hover:bg-red-700 rounded transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
