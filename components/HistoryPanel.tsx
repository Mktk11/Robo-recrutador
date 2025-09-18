import React, { useState } from 'react';
import { AnalysisResultWithId } from '../types';
import { ChevronDownIcon, HistoryIcon, TrashIcon } from './icons';

interface HistoryPanelProps {
  history: AnalysisResultWithId[];
  onSelectItem: (item: AnalysisResultWithId) => void;
  onClear: () => void;
  currentItemId: string | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectItem, onClear, currentItemId }) => {
  const [isOpen, setIsOpen] = useState(true);

  const getScoreColor = (score: number): string => {
    if (score < 50) return 'text-red-500';
    if (score < 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-xl font-semibold text-slate-700 dark:text-slate-300"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <HistoryIcon className="w-6 h-6 text-indigo-500" />
          Histórico de Análises
        </span>
        <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-4 animate-fade-in">
          {history.length > 0 ? (
            <>
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelectItem(item)}
                      className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors duration-200 ${
                        currentItemId === item.id 
                        ? 'bg-indigo-100 dark:bg-indigo-900/50' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.jobTitle}>
                          {item.jobTitle || 'Análise sem Título'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <span className={`text-lg font-bold ${getScoreColor(item.compatibilityScore)}`}>
                          {item.compatibilityScore}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  onClick={onClear}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Limpar Histórico
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma análise anterior encontrada.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
