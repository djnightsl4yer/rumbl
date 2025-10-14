import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Music, Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  genre: string;
  video_url?: string;
  youtube_id?: string;
  soundcloud_url?: string;
  spotify_url?: string;
  instagram_url?: string;
  website_url?: string;
  shotgun_url?: string;
  is_active: boolean;
}

interface Track {
  id: string;
  artist_id: string;
  title: string;
  soundcloud_track_id: string;
  soundcloud_embed_url: string;
  duration?: number;
  artwork_url?: string;
  is_featured: boolean;
  order_index: number;
}

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Record<string, Track[]>>({});
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [editingArtist, setEditingArtist] = useState<Partial<Artist>>({});
  const [newTrack, setNewTrack] = useState<Partial<Track>>({});
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
      alert('Erreur lors du chargement des artistes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async (artistId: string) => {
    try {
      const { data, error } = await supabase
        .from('artist_tracks')
        .select('*')
        .eq('artist_id', artistId)
        .order('order_index');

      if (error) throw error;
      setTracks((prev) => ({ ...prev, [artistId]: data || [] }));
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const saveArtist = async () => {
    try {
      if (editingArtist.id) {
        const { error } = await supabase
          .from('artists')
          .update(editingArtist)
          .eq('id', editingArtist.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('artists')
          .insert([editingArtist]);

        if (error) throw error;
      }

      await fetchArtists();
      setEditingArtist({});
      setIsAddingArtist(false);
      alert('Artiste enregistré avec succès');
    } catch (error) {
      console.error('Error saving artist:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const deleteArtist = async (id: string) => {
    if (!confirm('Supprimer cet artiste et tous ses sons ?')) return;

    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchArtists();
      if (selectedArtist?.id === id) {
        setSelectedArtist(null);
      }
      alert('Artiste supprimé');
    } catch (error) {
      console.error('Error deleting artist:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const saveTrack = async (artistId: string) => {
    try {
      const trackData = {
        ...newTrack,
        artist_id: artistId,
        order_index: tracks[artistId]?.length || 0,
      };

      const { error } = await supabase
        .from('artist_tracks')
        .insert([trackData]);

      if (error) throw error;

      await fetchTracks(artistId);
      setNewTrack({});
      alert('Son ajouté avec succès');
    } catch (error) {
      console.error('Error saving track:', error);
      alert('Erreur lors de l\'ajout du son');
    }
  };

  const deleteTrack = async (trackId: string, artistId: string) => {
    if (!confirm('Supprimer ce son ?')) return;

    try {
      const { error } = await supabase
        .from('artist_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;
      await fetchTracks(artistId);
      alert('Son supprimé');
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const selectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    fetchTracks(artist.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Gestion des Artistes</h1>
          <button
            onClick={() => {
              setIsAddingArtist(true);
              setEditingArtist({
                name: '',
                role: 'DJ',
                bio: '',
                image_url: '',
                genre: '',
                is_active: true,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Nouvel Artiste
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Artistes</h2>
            {artists.map((artist) => (
              <div
                key={artist.id}
                className={`p-4 bg-gray-900 rounded-lg border cursor-pointer transition-all ${
                  selectedArtist?.id === artist.id
                    ? 'border-red-600'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => selectArtist(artist)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {artist.image_url && (
                      <img
                        src={artist.image_url}
                        alt={artist.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{artist.name}</h3>
                      <p className="text-sm text-gray-400">{artist.role} - {artist.genre}</p>
                      <p className={`text-xs mt-1 ${artist.is_active ? 'text-green-500' : 'text-red-500'}`}>
                        {artist.is_active ? 'Actif' : 'Inactif'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingArtist(artist);
                        setIsAddingArtist(true);
                      }}
                      className="p-2 hover:bg-gray-800 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteArtist(artist.id);
                      }}
                      className="p-2 hover:bg-red-600 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            {selectedArtist ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Sons de {selectedArtist.name}
                  </h2>

                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <h3 className="font-bold mb-3">Ajouter un son SoundCloud</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Titre du son"
                        value={newTrack.title || ''}
                        onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 rounded"
                      />
                      <input
                        type="text"
                        placeholder="URL SoundCloud (ex: https://soundcloud.com/artist/track)"
                        value={newTrack.soundcloud_embed_url || ''}
                        onChange={(e) => setNewTrack({ ...newTrack, soundcloud_embed_url: e.target.value, soundcloud_track_id: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 rounded"
                      />
                      <input
                        type="text"
                        placeholder="URL de l'artwork (optionnel)"
                        value={newTrack.artwork_url || ''}
                        onChange={(e) => setNewTrack({ ...newTrack, artwork_url: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 rounded"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newTrack.is_featured || false}
                          onChange={(e) => setNewTrack({ ...newTrack, is_featured: e.target.checked })}
                        />
                        <span>Son en vedette</span>
                      </label>
                      <button
                        onClick={() => saveTrack(selectedArtist.id)}
                        disabled={!newTrack.title || !newTrack.soundcloud_embed_url}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        Ajouter le son
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tracks[selectedArtist.id]?.map((track) => (
                      <div
                        key={track.id}
                        className="p-4 bg-gray-900 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Music size={20} className="text-red-600" />
                          <div>
                            <p className="font-medium">{track.title}</p>
                            {track.is_featured && (
                              <span className="text-xs text-red-500">En vedette</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTrack(track.id, selectedArtist.id)}
                          className="p-2 hover:bg-red-600 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {(!tracks[selectedArtist.id] || tracks[selectedArtist.id].length === 0) && (
                      <p className="text-gray-500 text-center py-8">Aucun son ajouté</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Sélectionnez un artiste pour gérer ses sons
              </div>
            )}
          </div>
        </div>

        {isAddingArtist && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {editingArtist.id ? 'Modifier' : 'Nouvel'} Artiste
                </h2>
                <button onClick={() => setIsAddingArtist(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Nom</label>
                  <input
                    type="text"
                    value={editingArtist.name || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Rôle</label>
                  <select
                    value={editingArtist.role || 'DJ'}
                    onChange={(e) => setEditingArtist({ ...editingArtist, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  >
                    <option value="DJ">DJ</option>
                    <option value="Producer">Producer</option>
                    <option value="DJ/Producer">DJ/Producer</option>
                    <option value="Live Act">Live Act</option>
                    <option value="VJ">VJ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Genre</label>
                  <input
                    type="text"
                    value={editingArtist.genre || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Bio</label>
                  <textarea
                    value={editingArtist.bio || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">URL de l'image</label>
                  <input
                    type="text"
                    value={editingArtist.image_url || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">SoundCloud URL</label>
                  <input
                    type="text"
                    value={editingArtist.soundcloud_url || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, soundcloud_url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Shotgun URL</label>
                  <input
                    type="text"
                    value={editingArtist.shotgun_url || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, shotgun_url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={editingArtist.instagram_url || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, instagram_url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingArtist.is_active !== false}
                    onChange={(e) => setEditingArtist({ ...editingArtist, is_active: e.target.checked })}
                  />
                  <span>Artiste actif</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveArtist}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    <Save size={20} className="inline mr-2" />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setIsAddingArtist(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
