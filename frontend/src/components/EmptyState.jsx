import React from 'react';
import { InboxIcon } from '@heroicons/react/24/outline';

/**
 * Componente de estado vacío reutilizable
 * Para mostrar cuando no hay datos en listas/tablas
 */

const EmptyState = ({
  icon: Icon = InboxIcon,
  title = "No hay datos",
  description = "Aún no se han agregado elementos",
  actionLabel,
  onAction
}) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
