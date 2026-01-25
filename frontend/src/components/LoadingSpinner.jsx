import React from 'react';

/**
 * Componente de Loading mejorado y consistente
 */

const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`${sizeClass} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-4 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

export const FullPageLoader = ({ text = 'Cargando...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

export const TableLoader = () => {
  return (
    <tr>
      <td colSpan="100" className="text-center py-8">
        <LoadingSpinner size="md" text="Cargando datos..." />
      </td>
    </tr>
  );
};

export default LoadingSpinner;
