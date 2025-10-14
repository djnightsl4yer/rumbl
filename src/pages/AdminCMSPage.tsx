import { useState, useEffect } from 'react';
import { Shield, Users, Calendar, FileText, BarChart3, LogOut, Check, X, Edit2, Plus, Eye, Package, DollarSign, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = 'RUMBL_ADMIN_2025';

type AdminSection = 'overview' | 'ambassadors' | 'applications' | 'missions' | 'content' | 'orders' | 'analytics' | 'artists';

interface Ambassador {
  id: string;
  name: string;
  ref_code: string;
  email: string;
  total_sales: number;
  total_conversions: number;
  points: number;
  is_active: boolean;
  last_activity: string;
}

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  instagram: string;
  motivation: string;
  experience: string;
  availability: string;
  status: string;
  created_at: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  points_reward: number;
  deadline: string | null;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  product_type: string;
  customer_name: string;
  customer_email: string;
  order_details: any;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

interface AdminCMSPageProps {
  onNavigateToEdit?: (page: string) => void;
}

export default function AdminCMSPage({ onNavigateToEdit }: AdminCMSPageProps = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [currentSection, setCurrentSection] = useState<AdminSection>('overview');
  const [loading, setLoading] = useState(false);

  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedOrder] = useState<Order | null>(null);

  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    points_reward: 0,
    deadline: '',
  });

  const [stats, setStats] = useState({
    totalAmbassadors: 0,
    activeAmbassadors: 0,
    pendingApplications: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem('rumbl_cms_admin_auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, currentSection]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('rumbl_cms_admin_auth', 'true');
      setPassword('');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rumbl_cms_admin_auth');
    window.location.href = '/';
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: ambassadorsData } = await supabase
        .from('ambassadors')
        .select('*')
        .order('points', { ascending: false });

      const { data: applicationsData } = await supabase
        .from('ambassador_applications')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: missionsData } = await supabase
        .from('ambassador_missions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: ordersData } = await supabase
        .from('product_orders')
        .select('*')
        .order('created_at', { ascending: false });

      setAmbassadors(ambassadorsData || []);
      setApplications(applicationsData || []);
      setMissions(missionsData || []);
      setOrders(ordersData || []);

      setStats({
        totalAmbassadors: ambassadorsData?.length || 0,
        activeAmbassadors: ambassadorsData?.filter(a => a.is_active).length || 0,
        pendingApplications: applicationsData?.filter(a => a.status === 'pending').length || 0,
        totalOrders: ordersData?.length || 0,
        pendingOrders: ordersData?.filter(o => o.payment_status === 'pending').length || 0,
        totalSales: ordersData?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (appId: string) => {
    try {
      const { error } = await supabase.rpc('approve_ambassador_application', {
        application_id: appId
      });

      if (error) throw error;

      alert('Candidature approuvée! Un nouvel ambassadeur a été créé.');
      loadDashboardData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const rejectApplication = async (appId: string) => {
    try {
      const { error } = await supabase
        .from('ambassador_applications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', appId);

      if (error) throw error;

      alert('Candidature rejetée.');
      loadDashboardData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const createMission = async () => {
    if (!newMission.title || !newMission.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('ambassador_missions')
        .insert({
          title: newMission.title,
          description: newMission.description,
          points_reward: newMission.points_reward,
          deadline: newMission.deadline || null,
          status: 'active'
        });

      if (error) throw error;

      alert('Mission créée!');
      setNewMission({ title: '', description: '', points_reward: 0, deadline: '' });
      loadDashboardData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updates: any = { payment_status: status };
      if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('product_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      alert('Statut mis à jour!');
      loadDashboardData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const toggleAmbassadorStatus = async (ambassadorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ambassadors')
        .update({ is_active: !currentStatus })
        .eq('id', ambassadorId);

      if (error) throw error;

      loadDashboardData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-900/90 backdrop-blur-sm border-2 border-red-500 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <Shield size={64} className="mx-auto mb-4 text-red-500 animate-pulse" />
            <h1 className="text-4xl font-black text-white mb-2 tracking-wider">
              ADMIN CMS
            </h1>
            <p className="text-gray-400 font-mono text-sm">RÜMBL CONTENT MANAGEMENT SYSTEM</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
            >
              ACCÉDER AU CMS
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-red-500/20 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-wider mb-1 text-red-500">RÜMBL</h1>
            <p className="text-xs text-gray-400 font-mono">CMS Admin</p>
          </div>

          <nav className="space-y-2 mb-8">
            {[
              { id: 'overview', icon: BarChart3, label: 'Dashboard' },
              { id: 'ambassadors', icon: Users, label: 'Ambassadeurs' },
              { id: 'applications', icon: FileText, label: 'Candidatures' },
              { id: 'missions', icon: Calendar, label: 'Missions' },
              { id: 'quests', icon: Calendar, label: 'Quests', action: () => window.location.hash = 'admin-quests' },
              { id: 'orders', icon: Package, label: 'Commandes' },
              { id: 'artists', icon: Music, label: 'Artistes & Sons', action: () => window.location.hash = 'admin-artists' },
              { id: 'content', icon: Edit2, label: 'Contenu Site' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => item.action ? item.action() : setCurrentSection(item.id as AdminSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentSection === item.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-red-500 rounded-lg transition-all"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm">Déconnexion</span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            </div>
          )}

          {!loading && currentSection === 'overview' && (
            <div>
              <h2 className="text-4xl font-black mb-8 text-red-500">DASHBOARD</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 hover:border-red-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="text-blue-500" size={32} />
                    <span className="text-4xl font-black">{stats.activeAmbassadors}/{stats.totalAmbassadors}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Ambassadeurs Actifs</p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 hover:border-red-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="text-yellow-500" size={32} />
                    <span className="text-4xl font-black">{stats.pendingApplications}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Candidatures en attente</p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 hover:border-red-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Package className="text-green-500" size={32} />
                    <span className="text-4xl font-black">{stats.pendingOrders}/{stats.totalOrders}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Commandes en attente</p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 hover:border-red-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="text-purple-500" size={32} />
                    <span className="text-4xl font-black">{stats.totalSales.toFixed(2)}€</span>
                  </div>
                  <p className="text-gray-400 text-sm">Ventes Totales</p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 hover:border-red-500 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="text-red-500" size={32} />
                    <span className="text-4xl font-black">{missions.filter(m => m.status === 'active').length}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Missions Actives</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="text-yellow-500" />
                    Candidatures Récentes
                  </h3>
                  <div className="space-y-3">
                    {applications.filter(a => a.status === 'pending').slice(0, 5).map((app) => (
                      <div key={app.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{app.first_name} {app.last_name}</p>
                            <p className="text-sm text-gray-400">{app.instagram}</p>
                          </div>
                          <button
                            onClick={() => { setSelectedApplication(app); setCurrentSection('applications'); }}
                            className="bg-red-600 hover:bg-red-700 p-2 rounded transition-all"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {applications.filter(a => a.status === 'pending').length === 0 && (
                      <p className="text-gray-500 text-center py-4">Aucune candidature en attente</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Package className="text-green-500" />
                    Commandes Récentes
                  </h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">{order.customer_name}</p>
                            <p className="text-sm text-gray-400">{order.product_type === 'cdj_yugi' ? 'CDJ Yugi' : 'Exoskeleton'} - {order.total_amount}€</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.payment_status === 'paid' ? 'bg-green-600/20 text-green-400' :
                            order.payment_status === 'shipped' ? 'bg-blue-600/20 text-blue-400' :
                            'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Aucune commande</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && currentSection === 'ambassadors' && (
            <div>
              <h2 className="text-4xl font-black mb-8 text-red-500">GESTION AMBASSADEURS</h2>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-600/20 border-b border-red-500/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-black">NOM</th>
                        <th className="px-6 py-4 text-left text-sm font-black">CODE REF</th>
                        <th className="px-6 py-4 text-center text-sm font-black">POINTS</th>
                        <th className="px-6 py-4 text-center text-sm font-black">VENTES</th>
                        <th className="px-6 py-4 text-center text-sm font-black">STATUT</th>
                        <th className="px-6 py-4 text-center text-sm font-black">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ambassadors.map((amb) => (
                        <tr key={amb.id} className="border-b border-gray-800/50 hover:bg-red-900/10 transition-all">
                          <td className="px-6 py-4 font-bold">{amb.name}</td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-400">{amb.ref_code}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-yellow-600/20 border border-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                              {amb.points}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-green-500 font-bold">
                            {Number(amb.total_sales || 0).toFixed(2)}€
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleAmbassadorStatus(amb.id, amb.is_active)}
                              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                                amb.is_active
                                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                  : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                              }`}
                            >
                              {amb.is_active ? 'ACTIF' : 'INACTIF'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <a
                              href={`/ambassador-dashboard?code=${amb.ref_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                            >
                              <Eye size={16} />
                              Voir profil
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && currentSection === 'applications' && (
            <div>
              <h2 className="text-4xl font-black mb-8 text-red-500">CANDIDATURES AMBASSADEURS</h2>

              <div className="grid gap-6">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 ${
                      app.status === 'pending' ? 'border-yellow-500/50' :
                      app.status === 'approved' ? 'border-green-500/50' :
                      'border-red-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{app.first_name} {app.last_name}</h3>
                        <p className="text-gray-400">{app.email} • {app.instagram}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Soumis le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full font-bold ${
                        app.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                        app.status === 'approved' ? 'bg-green-600/20 text-green-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-sm text-gray-400 mb-2">MOTIVATION</h4>
                        <p className="text-gray-300">{app.motivation}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-400 mb-2">EXPÉRIENCE</h4>
                        <p className="text-gray-300">{app.experience || 'Aucune'}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-400 mb-2">DISPONIBILITÉ</h4>
                        <p className="text-gray-300">{app.availability}</p>
                      </div>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => approveApplication(app.id)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition-all"
                        >
                          <Check size={20} />
                          APPROUVER
                        </button>
                        <button
                          onClick={() => rejectApplication(app.id)}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold transition-all"
                        >
                          <X size={20} />
                          REJETER
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Aucune candidature
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && currentSection === 'missions' && (
            <div>
              <h2 className="text-4xl font-black mb-8 text-red-500">MISSIONS AMBASSADEURS</h2>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 mb-8">
                <h3 className="text-2xl font-bold mb-4">Créer une nouvelle mission</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={newMission.title}
                    onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                    placeholder="Titre de la mission"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="number"
                    value={newMission.points_reward}
                    onChange={(e) => setNewMission({ ...newMission, points_reward: parseInt(e.target.value) || 0 })}
                    placeholder="Points récompense"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                  <textarea
                    value={newMission.description}
                    onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                    placeholder="Description de la mission"
                    rows={3}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 md:col-span-2"
                  />
                  <input
                    type="datetime-local"
                    value={newMission.deadline}
                    onChange={(e) => setNewMission({ ...newMission, deadline: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  onClick={createMission}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold transition-all"
                >
                  <Plus size={20} />
                  CRÉER LA MISSION
                </button>
              </div>

              <div className="grid gap-4">
                {missions.map((mission) => (
                  <div key={mission.id} className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{mission.title}</h3>
                        <p className="text-gray-400">{mission.description}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full font-bold ${
                        mission.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {mission.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-yellow-500 font-bold">+{mission.points_reward} points</span>
                      {mission.deadline && (
                        <span className="text-gray-500">
                          Deadline: {new Date(mission.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {missions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Aucune mission créée
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && currentSection === 'orders' && (
            <div>
              <h2 className="text-4xl font-black mb-8 text-red-500">COMMANDES</h2>

              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">
                          {order.product_type === 'cdj_yugi' ? 'CDJ YUGI' : 'EXOSKELETON CUSTOM'}
                        </h3>
                        <p className="text-gray-400 mb-2">{order.customer_name} • {order.customer_email}</p>
                        <p className="text-sm text-gray-500">
                          Commandé le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-500 mb-2">{order.total_amount}€</p>
                        <p className="text-sm text-gray-400">{order.payment_method}</p>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <h4 className="font-bold text-sm text-gray-400 mb-2">DÉTAILS COMMANDE</h4>
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(order.order_details, null, 2)}
                      </pre>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'paid')}
                        disabled={order.payment_status === 'paid' || order.payment_status === 'shipped'}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                      >
                        Marquer payé
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        disabled={order.payment_status === 'shipped'}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                      >
                        Marquer expédié
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all"
                      >
                        Annuler
                      </button>
                      <span className={`ml-auto px-4 py-2 rounded-lg font-bold ${
                        order.payment_status === 'paid' ? 'bg-green-600/20 text-green-400' :
                        order.payment_status === 'shipped' ? 'bg-blue-600/20 text-blue-400' :
                        order.payment_status === 'cancelled' ? 'bg-red-600/20 text-red-400' :
                        'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Aucune commande
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && currentSection === 'content' && (
            <div>
              <h2 className="text-4xl font-black mb-8 text-red-500">ÉDITION CONTENU SITE</h2>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-8">
                <p className="text-gray-400 text-center mb-4">
                  Sélectionnez une page pour modifier son contenu
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Accueil', value: 'home' },
                    { label: 'Événements', value: 'events' },
                    { label: 'Artistes', value: 'artists' },
                    { label: 'À propos', value: 'about' }
                  ].map((page) => (
                    <button
                      key={page.value}
                      onClick={() => onNavigateToEdit?.(page.value)}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500 rounded-lg p-4 transition-all"
                    >
                      <Edit2 className="mx-auto mb-2 text-red-500" size={24} />
                      <p className="font-bold text-sm">{page.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && currentSection === 'analytics' && (
            <div>
              <h2 className="text-4xl font-black mb-8 text-red-500">ANALYTICS</h2>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-8">
                <p className="text-gray-400 text-center">
                  Statistiques détaillées à venir - Visiteurs, conversions, engagement...
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
