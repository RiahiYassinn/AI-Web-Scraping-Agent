import React, { useState } from 'react';
import { Database, Download, Search, Filter } from 'lucide-react';
import { ApiScrapingResult } from '../services/api';

interface ResultsViewerProps {
  result: ApiScrapingResult;
}

export function ResultsViewer({ result }: ResultsViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState<string>('all');

  const { data, metadata } = result;
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400">
          <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No data extracted</p>
        </div>
      </div>
    );
  }

  const allFields = Object.keys(data[0]);
  
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    const fieldsToSearch = selectedField === 'all' ? allFields : [selectedField];
    return fieldsToSearch.some(field => 
      String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportData = () => {
    const jsonStr = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-medium">Extracted Data</h3>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
              {filteredData.length} items
            </span>
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="pl-9 pr-8 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
            >
              <option value="all">All fields</option>
              {allFields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-400">
          Extracted from: {metadata.url} • Duration: {metadata.duration}ms
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-auto">
        <div className="space-y-3">
          {filteredData.map((item, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3">
              <div className="grid gap-2">
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-gray-400 text-sm font-medium min-w-[80px]">
                      {key}:
                    </span>
                    <span className="text-white text-sm flex-1">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}