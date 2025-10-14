import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContentData {
  [key: string]: any;
}

interface ContentSection {
  id: string;
  page: string;
  section: string;
  content: ContentData;
}

interface AdminEditContentPageProps {
  page: string;
  onBack: () => void;
}

export default function AdminEditContentPage({ page, onBack }: AdminEditContentPageProps) {

  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedContent, setEditedContent] = useState<Record<string, ContentData>>({});

  useEffect(() => {
    loadContent();
  }, [page]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('page', page)
        .order('section');

      if (error) throw error;

      setSections(data || []);
      const initialContent: Record<string, ContentData> = {};
      (data || []).forEach((section) => {
        initialContent[section.id] = section.content;
      });
      setEditedContent(initialContent);
    } catch (error) {
      console.error('Error loading content:', error);
      alert('Erreur lors du chargement du contenu');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (sectionId: string, field: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        const { error } = await supabase
          .from('site_content')
          .update({
            content: editedContent[section.id],
            updated_at: new Date().toISOString()
          })
          .eq('id', section.id);

        if (error) throw error;
      }

      alert('Contenu sauvegardé avec succès!');
      loadContent();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getPageTitle = () => {
    switch (page) {
      case 'home': return 'Accueil';
      case 'events': return 'Événements';
      case 'artists': return 'Artistes';
      case 'about': return 'À propos';
      default: return page;
    }
  };

  const renderField = (sectionId: string, field: string, value: any) => {
    if (typeof value === 'string' && value.length > 100) {
      return (
        <textarea
          value={editedContent[sectionId]?.[field] || ''}
          onChange={(e) => handleFieldChange(sectionId, field, e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 min-h-[100px]"
          rows={4}
        />
      );
    }

    return (
      <input
        type="text"
        value={editedContent[sectionId]?.[field] || ''}
        onChange={(e) => handleFieldChange(sectionId, field, e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-red-500">ÉDITER: {getPageTitle()}</h1>
              <p className="text-gray-400 text-sm mt-1">Modifiez le contenu de la page</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-bold transition-all"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={20} />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={20} />
                SAUVEGARDER
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-gray-900/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-red-400 uppercase">
                {section.section.replace('_', ' ')}
              </h3>

              <div className="space-y-4">
                {Object.entries(editedContent[section.id] || {}).map(([field, value]) => (
                  <div key={field}>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
                      {field}
                    </label>
                    {renderField(section.id, field, value)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun contenu trouvé pour cette page
          </div>
        )}
      </div>
    </div>
  );
}
