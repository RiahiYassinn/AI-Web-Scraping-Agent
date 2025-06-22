import React, { useEffect, useRef } from 'react';
import { Terminal, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { ApiTaskLog } from '../services/api';

interface LogViewerProps {
  logs: ApiTaskLog[];
  title?: string;
}

export function LogViewer({ logs, title = "Task Logs" }: LogViewerProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (level: ApiTaskLog['level']) => {
    switch (level) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getLogColor = (level: ApiTaskLog['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-300';
      case 'warning':
        return 'text-yellow-300';
      case 'error':
        return 'text-red-300';
      case 'success':
        return 'text-green-300';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <Terminal className="w-5 h-5 text-gray-400" />
        <h3 className="text-white font-medium">{title}</h3>
        {logs.length > 0 && (
          <span className="ml-auto text-xs text-gray-400">
            {logs.length} entries
          </span>
        )}
      </div>
      
      <div className="p-4 max-h-64 overflow-y-auto bg-gray-900 rounded-b-lg">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm">No logs yet...</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                {getLogIcon(log.level)}
                <span className="text-gray-400 text-xs font-mono min-w-[60px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={getLogColor(log.level)}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}