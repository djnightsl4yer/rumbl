import { useState, useRef, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import { supabase } from '../lib/supabase';

interface EditableElementProps {
  page: string;
  section: string;
  field: string;
  value: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  onUpdate?: (newValue: string) => void;
}

export default function EditableElement({
  page,
  section,
  field,
  value,
  as: Element = 'div',
  className = '',
  multiline = false,
  onUpdate
}: EditableElementProps) {
  const { isAdminMode } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existingContent } = await supabase
        .from('site_content')
        .select('*')
        .eq('page', page)
        .eq('section', section)
        .maybeSingle();

      if (existingContent) {
        const updatedContent = {
          ...existingContent.content,
          [field]: editValue
        };

        const { error } = await supabase
          .from('site_content')
          .update({
            content: updatedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingContent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_content')
          .insert({
            page,
            section,
            content: { [field]: editValue }
          });

        if (error) throw error;
      }

      onUpdate?.(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isAdminMode) {
    return <Element className={className}>{value}</Element>;
  }

  if (isEditing) {
    return (
      <div className="relative group">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`${className} bg-gray-800/90 border-2 border-yellow-500 rounded px-2 py-1 w-full min-h-[100px]`}
            rows={4}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`${className} bg-gray-800/90 border-2 border-yellow-500 rounded px-2 py-1 w-full`}
          />
        )}
        <div className="absolute -right-2 -top-2 flex gap-1 z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg disabled:opacity-50"
            title="Sauvegarder"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg disabled:opacity-50"
            title="Annuler"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group inline-block w-full">
      <Element className={className}>{value}</Element>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute -right-2 -top-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title={`Modifier ${field}`}
      >
        <Edit2 size={14} />
      </button>
      <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}
