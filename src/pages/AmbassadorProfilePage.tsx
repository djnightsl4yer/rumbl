import { useState, useEffect } from 'react';
import { User, Mail, Phone, Instagram, Link as LinkIcon, Save, LogOut, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Ambassador } from '../types/ambassador';
import { compressImage, formatFileSize } from '../utils/imageCompression';

export default function AmbassadorProfilePage() {
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram_handle: '',
    bio: '',
    profile_image_url: '',
    social_links: {
      tiktok: '',
      facebook: '',
      twitter: '',
      website: '',
    },
  });

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Vous devez être connecté pour accéder à cette page');
        return;
      }

      const { data, error } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        alert('Aucun profil ambassadeur associé à ce compte');
        return;
      }

      const profile = data;
      setAmbassador(profile);
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        instagram_handle: profile.instagram_handle || '',
        bio: profile.bio || '',
        profile_image_url: profile.profile_image_url || '',
        social_links: profile.social_links || {
          tiktok: '',
          facebook: '',
          twitter: '',
          website: '',
        },
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!ambassador) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('ambassadors')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          instagram_handle: formData.instagram_handle,
          bio: formData.bio,
          profile_image_url: formData.profile_image_url,
          social_links: formData.social_links,
        })
        .eq('id', ambassador.id);

      if (error) throw error;

      alert('Profil mis à jour avec succès!');
      await checkAuthAndLoadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ambassador) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    try {
      setSaving(true);

      const originalSize = formatFileSize(file.size);
      console.log(`Taille originale: ${originalSize}`);

      const compressedFile = await compressImage(file, 5);
      const compressedSize = formatFileSize(compressedFile.size);
      console.log(`Taille compressée: ${compressedSize}`);

      if (compressedFile.size !== file.size) {
        console.log(`Image compressée: ${originalSize} → ${compressedSize}`);
      }

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${ambassador.id}-${Date.now()}.${fileExt}`;
      const filePath = `ambassador-profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('ambassadors')
        .update({ profile_image_url: publicUrl })
        .eq('id', ambassador.id);

      if (updateError) throw updateError;

      setFormData({ ...formData, profile_image_url: publicUrl });
      alert(`Photo de profil mise à jour! (${compressedSize})`);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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
          <h1 className="text-3xl font-bold text-red-500 mb-4">Accès non autorisé</h1>
          <p className="text-gray-400">Vous devez être connecté en tant qu'ambassadeur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest mb-2 text-shadow-glow">
              MON PROFIL
            </h1>
            <p className="text-gray-400">@{ambassador.ref_code}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>

        <div className="bg-black/70 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                {formData.profile_image_url ? (
                  <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-500" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 p-2 rounded-full transition-all cursor-pointer" title="Changer la photo (max 5 MB - compression automatique)">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{ambassador.name}</h2>
              <p className="text-gray-400 mb-2">Ambassadeur RÜMBL</p>
              <p className="text-xs text-gray-500 italic">
                📸 Les images sont automatiquement compressées (max 5 MB)
              </p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-yellow-500 font-bold">{ambassador.points}</span> points
                </div>
                <div>
                  <span className="text-green-500 font-bold">{ambassador.total_conversions}</span> conversions
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold tracking-wider mb-2">
                <User className="inline mr-2" size={16} />
                NOM
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold tracking-wider mb-2">
                  <Mail className="inline mr-2" size={16} />
                  EMAIL
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold tracking-wider mb-2">
                  <Phone className="inline mr-2" size={16} />
                  TÉLÉPHONE
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold tracking-wider mb-2">
                <Instagram className="inline mr-2" size={16} />
                INSTAGRAM
              </label>
              <input
                type="text"
                value={formData.instagram_handle}
                onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                placeholder="@ton_pseudo"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold tracking-wider mb-2">
                BIO
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Parle-nous de toi..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold tracking-wider mb-4">
                <LinkIcon className="inline mr-2" size={16} />
                LIENS SOCIAUX
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.social_links.tiktok}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, tiktok: e.target.value }
                  })}
                  placeholder="TikTok URL"
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={formData.social_links.facebook}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, facebook: e.target.value }
                  })}
                  placeholder="Facebook URL"
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={formData.social_links.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, twitter: e.target.value }
                  })}
                  placeholder="Twitter/X URL"
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={formData.social_links.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    social_links: { ...formData.social_links, website: e.target.value }
                  })}
                  placeholder="Site Web URL"
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold tracking-wider mb-2">
                <Camera className="inline mr-2" size={16} />
                URL IMAGE DE PROFIL
              </label>
              <input
                type="text"
                value={formData.profile_image_url}
                onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save size={20} />
                  ENREGISTRER LES MODIFICATIONS
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
