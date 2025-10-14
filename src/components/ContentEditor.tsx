import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Image, Calendar, Users, FileText, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string;
  image_url: string;
  role: string;
  instagram: string;
  soundcloud: string;
  spotify: string;
  website: string;
  is_active: boolean;
  order_index: number;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  location: string;
  address: string;
  image_url: string;
  ticket_url: string;
  price: string;
  lineup: any[];
  status: string;
  is_featured: boolean;
}

type ContentTab = 'artists' | 'events' | 'home' | 'about';

export default function ContentEditor() {
  const [activeTab, setActiveTab] = useState<ContentTab>('artists');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingArtist, setEditingArtist] = useState<Partial<Artist> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*')
        .order('order_index', { ascending: true });

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      setArtists(artistsData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveArtist = async () => {
    if (!editingArtist?.name) {
      alert('Le nom est obligatoire');
      return;
    }

    try {
      const slug = editingArtist.slug || editingArtist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const artistData = {
        ...editingArtist,
        slug,
        updated_at: new Date().toISOString()
      };

      if (isCreatingNew) {
        const { error } = await supabase
          .from('artists')
          .insert([artistData]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('artists')
          .update(artistData)
          .eq('id', editingArtist.id);
        if (error) throw error;
      }

      alert('Artiste sauvegardé!');
      setEditingArtist(null);
      setIsCreatingNew(false);
      loadData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const deleteArtist = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet artiste?')) return;

    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Artiste supprimé!');
      loadData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const toggleArtistActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('artists')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const saveEvent = async () => {
    if (!editingEvent?.title) {
      alert('Le titre est obligatoire');
      return;
    }

    try {
      const slug = editingEvent.slug || editingEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const eventData = {
        ...editingEvent,
        slug,
        updated_at: new Date().toISOString()
      };

      if (isCreatingNew) {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        if (error) throw error;
      }

      alert('Événement sauvegardé!');
      setEditingEvent(null);
      setIsCreatingNew(false);
      loadData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Événement supprimé!');
      loadData();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  return (
    <div>
      <h2 className="text-4xl font-black mb-8 text-red-500">ÉDITEUR DE CONTENU</h2>

      <div className="mb-6 flex gap-4 flex-wrap">
        {[
          { id: 'artists', label: 'Artistes', icon: Users },
          { id: 'events', label: 'Événements', icon: Calendar },
          { id: 'home', label: 'Page Accueil', icon: FileText },
          { id: 'about', label: 'Page À Propos', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ContentTab)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'artists' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold">Gestion des Artistes</h3>
            <button
              onClick={() => {
                setEditingArtist({
                  name: '',
                  bio: '',
                  role: 'DJ',
                  image_url: '',
                  instagram: '',
                  soundcloud: '',
                  spotify: '',
                  website: '',
                  is_active: true,
                  order_index: artists.length
                });
                setIsCreatingNew(true);
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition-all"
            >
              <Plus size={20} />
              NOUVEL ARTISTE
            </button>
          </div>

          {editingArtist && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 mb-6">
              <h4 className="text-xl font-bold mb-4">
                {isCreatingNew ? 'Créer un nouvel artiste' : 'Modifier l\'artiste'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Nom *</label>
                  <input
                    type="text"
                    value={editingArtist.name || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Rôle</label>
                  <select
                    value={editingArtist.role || 'DJ'}
                    onChange={(e) => setEditingArtist({ ...editingArtist, role: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="DJ">DJ</option>
                    <option value="Producer">Producer</option>
                    <option value="DJ/Producer">DJ/Producer</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Bio</label>
                  <textarea
                    value={editingArtist.bio || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">URL Image</label>
                  <input
                    type="text"
                    value={editingArtist.image_url || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, image_url: e.target.value })}
                    placeholder="/path/to/image.jpg"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Instagram</label>
                  <input
                    type="text"
                    value={editingArtist.instagram || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, instagram: e.target.value })}
                    placeholder="@username"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">SoundCloud</label>
                  <input
                    type="text"
                    value={editingArtist.soundcloud || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, soundcloud: e.target.value })}
                    placeholder="https://soundcloud.com/..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Spotify</label>
                  <input
                    type="text"
                    value={editingArtist.spotify || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, spotify: e.target.value })}
                    placeholder="https://open.spotify.com/..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Site Web</label>
                  <input
                    type="text"
                    value={editingArtist.website || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={editingArtist.order_index || 0}
                    onChange={(e) => setEditingArtist({ ...editingArtist, order_index: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveArtist}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition-all"
                >
                  <Save size={20} />
                  SAUVEGARDER
                </button>
                <button
                  onClick={() => {
                    setEditingArtist(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
                >
                  ANNULER
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 ${
                  artist.is_active ? 'border-green-500/30' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  {artist.image_url && (
                    <img
                      src={artist.image_url}
                      alt={artist.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold">{artist.name}</h4>
                      <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs font-bold">
                        {artist.role}
                      </span>
                      {artist.is_active ? (
                        <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                          <Eye size={12} /> VISIBLE
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs font-bold flex items-center gap-1">
                          <EyeOff size={12} /> CACHÉ
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{artist.bio}</p>
                    <div className="flex gap-2 text-sm">
                      {artist.instagram && (
                        <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300">
                          Instagram
                        </a>
                      )}
                      {artist.soundcloud && (
                        <a href={artist.soundcloud} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                          SoundCloud
                        </a>
                      )}
                      {artist.spotify && (
                        <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
                          Spotify
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setEditingArtist(artist);
                        setIsCreatingNew(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleArtistActive(artist.id, artist.is_active)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        artist.is_active
                          ? 'bg-gray-600 hover:bg-gray-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {artist.is_active ? 'Cacher' : 'Afficher'}
                    </button>
                    <button
                      onClick={() => deleteArtist(artist.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold">Gestion des Événements</h3>
            <button
              onClick={() => {
                setEditingEvent({
                  title: '',
                  description: '',
                  event_date: '',
                  location: '',
                  address: '',
                  image_url: '',
                  ticket_url: '',
                  price: '',
                  lineup: [],
                  status: 'upcoming',
                  is_featured: false
                });
                setIsCreatingNew(true);
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition-all"
            >
              <Plus size={20} />
              NOUVEL ÉVÉNEMENT
            </button>
          </div>

          {editingEvent && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 mb-6">
              <h4 className="text-xl font-bold mb-4">
                {isCreatingNew ? 'Créer un nouvel événement' : 'Modifier l\'événement'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Titre *</label>
                  <input
                    type="text"
                    value={editingEvent.title || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Date</label>
                  <input
                    type="datetime-local"
                    value={editingEvent.event_date ? new Date(editingEvent.event_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Description</label>
                  <textarea
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Lieu</label>
                  <input
                    type="text"
                    value={editingEvent.location || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    placeholder="Nom du lieu"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Adresse</label>
                  <input
                    type="text"
                    value={editingEvent.address || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, address: e.target.value })}
                    placeholder="Adresse complète"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">URL Image</label>
                  <input
                    type="text"
                    value={editingEvent.image_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                    placeholder="/path/to/poster.jpg"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">URL Billets (Shotgun)</label>
                  <input
                    type="text"
                    value={editingEvent.ticket_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, ticket_url: e.target.value })}
                    placeholder="https://shotgun.live/..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Prix</label>
                  <input
                    type="text"
                    value={editingEvent.price || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, price: e.target.value })}
                    placeholder="15€ - 20€"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Statut</label>
                  <select
                    value={editingEvent.status || 'upcoming'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="upcoming">À venir</option>
                    <option value="past">Passé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingEvent.is_featured || false}
                    onChange={(e) => setEditingEvent({ ...editingEvent, is_featured: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="featured" className="text-sm font-bold">
                    Afficher sur la page d'accueil
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveEvent}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition-all"
                >
                  <Save size={20} />
                  SAUVEGARDER
                </button>
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
                >
                  ANNULER
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 ${
                  event.is_featured ? 'border-yellow-500/50' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold">{event.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        event.status === 'upcoming' ? 'bg-green-600/20 text-green-400' :
                        event.status === 'past' ? 'bg-gray-600/20 text-gray-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {event.status === 'upcoming' ? 'À VENIR' : event.status === 'past' ? 'PASSÉ' : 'ANNULÉ'}
                      </span>
                      {event.is_featured && (
                        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs font-bold">
                          ⭐ PAGE ACCUEIL
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{event.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      {event.event_date && (
                        <span>📅 {new Date(event.event_date).toLocaleDateString('fr-FR')}</span>
                      )}
                      {event.location && <span>📍 {event.location}</span>}
                      {event.price && <span>💰 {event.price}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setIsCreatingNew(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'home' || activeTab === 'about') && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-8">
          <p className="text-gray-400 text-center">
            Éditeur de sections personnalisées à venir pour {activeTab === 'home' ? 'la page d\'accueil' : 'la page à propos'}
          </p>
        </div>
      )}
    </div>
  );
}
