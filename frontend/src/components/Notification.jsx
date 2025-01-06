import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg animate-fade-in">
      {type === 'success' ? (
        <div className="bg-green-100 text-green-800 flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5" />
          {message}
        </div>
      ) : (
        <div className="bg-red-100 text-red-800 flex items-center gap-2">
          <XCircleIcon className="h-5 w-5" />
          {message}
        </div>
      )}
    </div>
  );
}