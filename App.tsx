import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResultWithId } from './types';
import { analyzeResumeAndJob } from './services/geminiService';
import AnalysisDisplay from './components/AnalysisDisplay';
import { BotIcon, ClipboardIcon, FileTextIcon, SparklesIcon } from './components/icons';
import HistoryPanel from './components/HistoryPanel';

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultWithId | null>(null);
  const [history, setHistory] = useState<AnalysisResultWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('recruiterBotHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Falha ao carregar o histórico do localStorage", e);
      localStorage.removeItem('recruiterBotHistory');
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      setError('Por favor, preencha ambos os campos: Vaga e Currículo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeResumeAndJob(jobDescription, resume);
      const newAnalysis: AnalysisResultWithId = {
        ...result,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      setAnalysisResult(newAnalysis);

      const updatedHistory = [newAnalysis, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('recruiterBotHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao analisar os dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [jobDescription, resume, history]);

  const handleSelectHistoryItem = (item: AnalysisResultWithId) => {
    setAnalysisResult(item);
     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza de que deseja apagar todo o histórico?')) {
      setHistory([]);
      setAnalysisResult(null);
      localStorage.removeItem('recruiterBotHistory');
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <BotIcon className="w-12 h-12 text-indigo-500" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Robô Recrutador IA
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Cole a descrição da vaga e seu currículo para receber uma análise de compatibilidade instantânea.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <label htmlFor="job-description" className="flex items-center gap-2 text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
                <ClipboardIcon className="w-6 h-6 text-indigo-500" />
                Vaga de Interesse
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Cole a descrição completa da vaga aqui..."
                className="w-full h-80 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none text-sm leading-6"
                disabled={isLoading}
              />
            </div>
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <label htmlFor="resume" className="flex items-center gap-2 text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
                <FileTextIcon className="w-6 h-6 text-indigo-500" />
                Seu Currículo
              </label>
              <textarea
                id="resume"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Cole o conteúdo do seu currículo aqui..."
                className="w-full h-80 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none text-sm leading-6"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analisando...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Analisar Compatibilidade
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-8 text-center bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl max-w-2xl mx-auto">
              <p>{error}</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-10">
                <HistoryPanel 
                    history={history} 
                    onSelectItem={handleSelectHistoryItem} 
                    onClear={handleClearHistory}
                    currentItemId={analysisResult?.id ?? null}
                />
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="mt-10">
              <AnalysisDisplay result={analysisResult} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
