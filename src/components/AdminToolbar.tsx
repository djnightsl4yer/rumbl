import { X, Eye, Settings } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

interface AdminToolbarProps {
  onExit: () => void;
}

export default function AdminToolbar({ onExit }: AdminToolbarProps) {
  const { isAdminMode } = useAdmin();

  if (!isAdminMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-6 shadow-lg z-50 border-b-4 border-yellow-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="animate-pulse" size={24} />
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider">MODE ÉDITION ACTIVÉ</h2>
            <p className="text-xs text-yellow-100">Survolez les éléments pour les modifier</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
            <Eye size={18} />
            <span className="text-sm font-bold">Éléments éditables visibles</span>
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition-all shadow-lg"
          >
            <X size={20} />
            QUITTER LE MODE ÉDITION
          </button>
        </div>
      </div>
    </div>
  );
}
