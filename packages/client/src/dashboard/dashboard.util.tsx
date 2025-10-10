import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'IN_PROGRESS':
      return <Clock className="w-4 h-4 text-blue-600" />;
    case 'FAILED':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return '✅';
    case 'IN_PROGRESS':
      return '🔄';
    case 'FAILED':
      return '❌';
    default:
      return '⏸️';
  }
};
