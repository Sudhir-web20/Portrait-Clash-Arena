import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`px-6 py-4 rounded-2xl shadow-2xl glass border-2 animate-in slide-in-from-right duration-300 pointer-events-auto
              ${toast.type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-400' : ''}
              ${toast.type === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-400' : ''}
              ${toast.type === 'info' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : ''}
              ${toast.type === 'warning' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
