import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAdminMode: boolean;
  setIsAdminMode: (value: boolean) => void;
  editingElement: string | null;
  setEditingElement: (id: string | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingElement, setEditingElement] = useState<string | null>(null);

  return (
    <AdminContext.Provider value={{ isAdminMode, setIsAdminMode, editingElement, setEditingElement }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
