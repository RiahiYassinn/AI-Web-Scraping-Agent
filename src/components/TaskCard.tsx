import React from 'react';
import { Clock, CheckCircle, XCircle, Loader, Eye, Calendar } from 'lucide-react';
import { ApiObjective } from '../services/api';

interface TaskCardProps {
  objective: ApiObjective;
  onViewDetails: (objective: ApiObjective) => void;
}

export function TaskCard({ objective, onViewDetails }: TaskCardProps) {
  const getStatusIcon = () => {
    switch (objective.status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'analyzing':
      case 'scraping':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (objective.status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'analyzing':
      case 'scraping':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
            {objective.status}
          </span>
        </div>
        <button
          onClick={() => onViewDetails(objective)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-white font-medium mb-2 line-clamp-2">
        {objective.description}
      </h3>

      <p className="text-gray-400 text-sm mb-3 truncate">
        {objective.url}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(objective.createdAt)}
        </div>
        {objective.completedAt && (
          <div>
            Completed {formatDate(objective.completedAt)}
          </div>
        )}
      </div>

      {objective.error && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs">
          {objective.error}
        </div>
      )}
    </div>
  );
}