import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Componente de notificación toast mejorado
 * Usa react-hot-toast pero con estilos consistentes
 */

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

const toastColors = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200'
};

export const CustomToast = ({ message, type = 'info', onClose }) => {
  const Icon = toastIcons[type] || Info;
  const colorClass = toastColors[type];

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${colorClass} shadow-lg min-w-[300px]`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

/**
 * Hook personalizado para manejo de notificaciones
 */
export const useNotification = () => {
  const notify = {
    success: (message) => {
      console.log('✅', message);
      // Integración con toast real si lo tienes
    },
    error: (message) => {
      console.error('❌', message);
    },
    warning: (message) => {
      console.warn('⚠️', message);
    },
    info: (message) => {
      console.info('ℹ️', message);
    }
  };

  return notify;
};

export default CustomToast;
