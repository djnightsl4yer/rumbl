import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, DollarSign, Users, Copy, Check, Share2, ExternalLink, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Ambassador, AmbassadorSale, AmbassadorLink } from '../types/ambassador';

export default function AmbassadorDashboardPage() {
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [sales, setSales] = useState<AmbassadorSale[]>([]);
  const [links, setLinks] = useState<AmbassadorLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refCode, setRefCode] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [newPlatform, setNewPlatform] = useState('instagram');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code') || 'alex';
    setRefCode(code);
    loadAmbassadorData(code);
  }, []);

  const loadAmbassadorData = async (code: string) => {
    try {
      setLoading(true);

      const { data: ambassadorData, error: ambassadorError } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('ref_code', code)
        .maybeSingle();

      if (ambassadorError) throw ambassadorError;
      if (!ambassadorData) {
        alert('Ambassadeur non trouvé');
        return;
      }

      setAmbassador(ambassadorData);

      const { data: salesData, error: salesError } = await supabase
        .from('ambassador_sales')
        .select('*')
        .eq('ambassador_id', ambassadorData.id)
        .order('sale_date', { ascending: false })
        .limit(10);

      if (salesError) throw salesError;
      setSales(salesData || []);

      const { data: linksData, error: linksError } = await supabase
        .from('ambassador_links')
        .select('*')
        .eq('ambassador_id', ambassadorData.id)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;
      setLinks(linksData || []);
    } catch (error) {
      console.error('Error loading ambassador data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async () => {
    if (!ambassador) return;

    try {
      const { error } = await supabase.rpc('generate_ambassador_link', {
        p_ambassador_id: ambassador.id,
        p_platform: newPlatform
      });

      if (error) throw error;

      await loadAmbassadorData(refCode);
      alert('Lien généré avec succès!');
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Erreur lors de la génération du lien');
    }
  };

  const copyToClipboard = (text: string, linkId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(linkId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen pt-24 pb-16 px-4">
        <div className="relative z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (!ambassador) {
    return (
      <div className="relative min-h-screen pt-24 pb-16 px-4">
        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Ambassadeur non trouvé</h1>
          <p className="text-gray-400">Code de référence invalide</p>
        </div>
      </div>
    );
  }

  const totalRevenue = sales
    .filter(s => s.status === 'confirmed' || s.status === 'paid')
    .reduce((sum, sale) => sum + Number(sale.amount), 0);

  const pendingCommission = sales
    .filter(s => s.status === 'pending')
    .reduce((sum, sale) => sum + Number(sale.commission), 0);

  const paidCommission = sales
    .filter(s => s.status === 'paid')
    .reduce((sum, sale) => sum + Number(sale.commission), 0);

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow">
            DASHBOARD AMBASSADEUR
          </h1>
          <p className="text-2xl text-red-500 font-bold mb-2">{ambassador.name}</p>
          <p className="text-gray-400">@{ambassador.ref_code}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-black/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <span className="text-3xl font-bold text-white">{ambassador.points}</span>
            </div>
            <p className="text-gray-400 text-sm">Points Totaux</p>
          </div>

          <div className="bg-black/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10 text-green-500" />
              <span className="text-3xl font-bold text-white">{totalRevenue.toFixed(2)}€</span>
            </div>
            <p className="text-gray-400 text-sm">Ventes Générées</p>
          </div>

          <div className="bg-black/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 text-blue-500" />
              <span className="text-3xl font-bold text-white">{ambassador.total_conversions}</span>
            </div>
            <p className="text-gray-400 text-sm">Conversions</p>
          </div>

          <div className="bg-black/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 text-red-500" />
              <span className="text-3xl font-bold text-white">{ambassador.total_clicks}</span>
            </div>
            <p className="text-gray-400 text-sm">Clics Totaux</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-black/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-purple-500">{paidCommission.toFixed(2)}€</span>
            </div>
            <p className="text-gray-400 text-sm">Commissions Payées</p>
          </div>

          <div className="bg-black/70 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">{pendingCommission.toFixed(2)}€</span>
            </div>
            <p className="text-gray-400 text-sm">Commissions En Attente</p>
          </div>
        </div>

        <div className="bg-black/70 backdrop-blur-sm border border-red-500/30 rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold tracking-wider mb-6 flex items-center">
            <Share2 className="mr-3 text-red-500" />
            TES LIENS DE PARTAGE
          </h2>

          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="website">Site Web</option>
                <option value="email">Email</option>
              </select>
              <button
                onClick={generateLink}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
              >
                Générer Nouveau Lien
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {links.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun lien généré. Créez votre premier lien ci-dessus!</p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-red-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-sm font-bold">
                          {link.platform}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {link.total_clicks} clics • {link.conversions} conversions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-gray-300 bg-black/50 px-3 py-1 rounded flex-1 overflow-x-auto">
                          {link.link_url}
                        </code>
                        <button
                          onClick={() => copyToClipboard(link.link_url, link.id)}
                          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded transition-all"
                          title="Copier le lien"
                        >
                          {copiedLink === link.id ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                        <a
                          href={link.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded transition-all"
                          title="Ouvrir le lien"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                  {link.last_used && (
                    <p className="text-gray-500 text-xs">
                      Dernière utilisation: {new Date(link.last_used).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-black/70 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
          <h2 className="text-3xl font-bold tracking-wider mb-6 flex items-center">
            <BarChart3 className="mr-3 text-red-500" />
            HISTORIQUE DES VENTES
          </h2>

          <div className="space-y-4">
            {sales.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucune vente enregistrée pour le moment</p>
            ) : (
              sales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-red-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-bold">{sale.event_name || sale.sale_type}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            sale.status === 'paid'
                              ? 'bg-green-600/20 text-green-400'
                              : sale.status === 'confirmed'
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'bg-orange-600/20 text-orange-400'
                          }`}
                        >
                          {sale.status === 'paid' ? 'Payé' : sale.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {sale.quantity} {sale.sale_type}(s) • {Number(sale.amount).toFixed(2)}€
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold text-lg">+{Number(sale.commission).toFixed(2)}€</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
