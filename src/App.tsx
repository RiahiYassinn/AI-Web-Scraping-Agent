import React, { useState, useEffect } from 'react';
import { Bot, Activity, History, Settings, Wifi, WifiOff } from 'lucide-react';
import { ObjectiveForm } from './components/ObjectiveForm';
import { TaskCard } from './components/TaskCard';
import { LogViewer } from './components/LogViewer';
import { ResultsViewer } from './components/ResultsViewer';
import { apiService, ApiObjective, ApiTaskLog, ApiScrapingResult } from './services/api';
import { usePolling } from './hooks/usePolling';

function App() {
  const [objectives, setObjectives] = useState<ApiObjective[]>([]);
  const [selectedObjective, setSelectedObjective] = useState<ApiObjective | null>(null);
  const [results, setResults] = useState<Record<string, ApiScrapingResult>>({});
  const [logs, setLogs] = useState<ApiTaskLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'logs'>('form');
  const [isConnected, setIsConnected] = useState(true);

  // Load initial data
  useEffect(() => {
    loadObjectives();
    checkConnection();
  }, []);

  // Poll for updates when there are active objectives
  const hasActiveObjectives = objectives.some(obj => 
    obj.status === 'pending' || obj.status === 'analyzing' || obj.status === 'scraping'
  );

  usePolling(() => {
    if (hasActiveObjectives) {
      loadObjectives();
      if (selectedObjective) {
        loadObjectiveDetails(selectedObjective.id);
      }
    }
  }, 2000, hasActiveObjectives);

  const checkConnection = async () => {
    try {
      await apiService.healthCheck();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const loadObjectives = async () => {
    try {
      const response = await apiService.getObjectives();
      setObjectives(response.objectives.map(obj => ({
        ...obj,
        createdAt: obj.createdAt,
        completedAt: obj.completedAt
      })));
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to load objectives:', error);
      setIsConnected(false);
    }
  };

  const loadObjectiveDetails = async (objectiveId: string) => {
    try {
      const response = await apiService.getObjective(objectiveId);
      
      // Update logs
      setLogs(response.logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })));

      // Update result if available
      if (response.result) {
        setResults(prev => ({
          ...prev,
          [objectiveId]: {
            ...response.result!,
            metadata: {
              ...response.result!.metadata,
              timestamp: new Date(response.result!.metadata.timestamp)
            }
          }
        }));
      }

      // Update selected objective
      const updatedObjective = {
        ...response.objective,
        createdAt: response.objective.createdAt,
        completedAt: response.objective.completedAt
      };
      setSelectedObjective(updatedObjective);

    } catch (error) {
      console.error('Failed to load objective details:', error);
    }
  };

  const handleNewObjective = async (objectiveData: { description: string; url: string }) => {
    setIsProcessing(true);
    
    try {
      const response = await apiService.createObjective(objectiveData);
      const newObjective = {
        ...response.objective,
        createdAt: response.objective.createdAt,
        completedAt: response.objective.completedAt
      };
      
      setObjectives(prev => [newObjective, ...prev]);
      setSelectedObjective(newObjective);
      setActiveTab('logs');
      
      // Start polling for this objective
      loadObjectiveDetails(newObjective.id);
      
    } catch (error) {
      console.error('Failed to create objective:', error);
      alert('Failed to create scraping objective. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (objective: ApiObjective) => {
    setSelectedObjective(objective);
    setActiveTab('logs');
    loadObjectiveDetails(objective.id);
  };

  const currentResult = selectedObjective ? results[selectedObjective.id] : null;
  const filteredLogs = selectedObjective 
    ? logs.filter(log => log.objectiveId === selectedObjective.id)
    : logs;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bot className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Web Scraping Agent</h1>
              <p className="text-gray-400 text-sm">Goal-driven web scraping with Gemini AI & Playwright</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              isConnected ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">
                {objectives.filter(obj => obj.status === 'completed').length} completed
              </span>
            </div>
            <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
              <Settings className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm">Gemini 1.5 Flash</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-colors ${
                  activeTab === 'form' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                New Task
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                History ({objectives.length})
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-colors ${
                  activeTab === 'logs' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                Logs ({filteredLogs.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'form' && (
              <ObjectiveForm onSubmit={handleNewObjective} isProcessing={isProcessing} />
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {objectives.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                    <History className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">No scraping tasks yet</p>
                    <p className="text-gray-500 text-sm">Create your first objective to get started</p>
                  </div>
                ) : (
                  objectives.map(objective => (
                    <TaskCard 
                      key={objective.id} 
                      objective={objective} 
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <LogViewer 
                logs={filteredLogs} 
                title={selectedObjective ? `Logs for: ${selectedObjective.description}` : "All Logs"}
              />
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {selectedObjective && selectedObjective.status === 'completed' && currentResult ? (
              <ResultsViewer result={currentResult} />
            ) : selectedObjective ? (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-medium mb-3">Task Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Objective:</span>
                    <p className="text-white mt-1">{selectedObjective.description}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">URL:</span>
                    <p className="text-blue-400 mt-1 break-all">{selectedObjective.url}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <p className="text-white mt-1 capitalize">{selectedObjective.status}</p>
                  </div>
                  {selectedObjective.error && (
                    <div>
                      <span className="text-gray-400">Error:</span>
                      <p className="text-red-400 mt-1">{selectedObjective.error}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-white font-medium mb-2">Welcome to AI Web Scraping Agent</h3>
                <p className="text-gray-400 mb-4">
                  Create a scraping objective to see intelligent web data extraction in action.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Powered by Gemini 1.5 Flash for objective analysis</p>
                  <p>• Real browser automation with Playwright</p>
                  <p>• Human-like scraping behavior</p>
                  <p>• Real-time progress monitoring</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;