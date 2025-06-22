import React, { useState } from 'react';
import { Target, Globe, Zap } from 'lucide-react';
import { ScrapingObjective } from '../types';

interface ObjectiveFormProps {
  onSubmit: (objective: Omit<ScrapingObjective, 'id' | 'status' | 'createdAt'>) => void;
  isProcessing: boolean;
}

export function ObjectiveForm({ onSubmit, isProcessing }: ObjectiveFormProps) {
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && url.trim()) {
      onSubmit({
        description: description.trim(),
        url: url.trim()
      });
      setDescription('');
      setUrl('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Target className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Define Scraping Objective</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Objective Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to scrape... (e.g., 'Extract product names and prices from the e-commerce site')"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isProcessing}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
            Target URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!description.trim() || !url.trim() || isProcessing}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <Zap className="w-5 h-5" />
          {isProcessing ? 'Processing...' : 'Start Scraping'}
        </button>
      </form>
    </div>
  );
}