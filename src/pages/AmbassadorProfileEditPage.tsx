import { useState, useEffect } from 'react';
import { User, Link as LinkIcon, Save, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Ambassador {
  id: string;
  name: string;
  email: string;
  ref_code: string;
  instagram_handle: string;
  phone: string;
  bio: string;
  profile_image_url: string;
  social_links: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
  };
}

export default function AmbassadorProfileEditPage() {
  const navigate = useNavigate();
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [promoLinks, setPromoLinks] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/ambassadeurs/login');
      return;
    }

    fetchProfile(user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('ambassadors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      navigate('/ambassadeurs/login');
      return;
    }

    if (data) {
      setAmbassador(data);
      setImagePreview(data.profile_image_url || '');
      generatePromoLinks(data.ref_code);
    }
    setLoading(false);
  };

  const generatePromoLinks = (refCode: string) => {
    const baseUrl = window.location.origin;
    setPromoLinks([
      `${baseUrl}/?ref=${refCode}`,
      `${baseUrl}/events?ref=${refCode}`,
      `${baseUrl}/merch?ref=${refCode}`
    ]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambassador) return;

    setSaving(true);

    try {
      let profileImageUrl = ambassador.profile_image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${ambassador.id}/profile.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('ambassador-profiles')
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('ambassador-profiles')
          .getPublicUrl(fileName);

        profileImageUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('ambassadors')
        .update({
          name: ambassador.name,
          email: ambassador.email,
          instagram_handle: ambassador.instagram_handle,
          phone: ambassador.phone,
          bio: ambassador.bio,
          profile_image_url: profileImageUrl,
          social_links: ambassador.social_links
        })
        .eq('id', ambassador.id);

      if (updateError) throw updateError;

      alert('Profil mis à jour avec succès !');
      navigate('/ambassadeurs/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!ambassador) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest mb-4 text-shadow-glow">
            MON PROFIL
          </h1>
          <p className="text-gray-400 tracking-wide">
            Personnalise ton profil et génère tes liens promo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900/80 backdrop-blur-sm border-2 border-red-500/30 rounded-lg p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <User className="mr-3 text-red-500" />
                Informations
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-4 border-red-500">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={48} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <User size={16} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-wider mb-2">NOM</label>
                  <input
                    type="text"
                    value={ambassador.name}
                    onChange={(e) => setAmbassador({ ...ambassador, name: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-wider mb-2">EMAIL</label>
                  <input
                    type="email"
                    value={ambassador.email}
                    onChange={(e) => setAmbassador({ ...ambassador, email: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-wider mb-2">INSTAGRAM</label>
                  <input
                    type="text"
                    value={ambassador.instagram_handle || ''}
                    onChange={(e) => setAmbassador({ ...ambassador, instagram_handle: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="@ton_pseudo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-wider mb-2">TÉLÉPHONE</label>
                  <input
                    type="tel"
                    value={ambassador.phone || ''}
                    onChange={(e) => setAmbassador({ ...ambassador, phone: e.target.value })}
                    className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold tracking-wider mb-2">BIO</label>
                  <textarea
                    value={ambassador.bio || ''}
                    onChange={(e) => setAmbassador({ ...ambassador, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                    placeholder="Parle-nous de toi..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-4 rounded-md transition-all flex items-center justify-center"
                >
                  <Save size={20} className="mr-3" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-gray-900/80 backdrop-blur-sm border-2 border-red-500/30 rounded-lg p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <LinkIcon className="mr-2 text-red-500" />
                Liens Promo
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Partage ces liens sur tes réseaux pour tracker tes conversions
              </p>

              <div className="space-y-3">
                {promoLinks.map((link, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={link}
                      readOnly
                      className="w-full bg-black/60 border-2 border-gray-600 rounded-md px-4 py-2 pr-12 text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-all"
                    >
                      {copiedLink === link ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-red-600/10 border border-red-500/30 rounded-md">
                <p className="text-xs text-gray-300">
                  <span className="font-bold text-red-500">Ton code:</span> {ambassador.ref_code}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
