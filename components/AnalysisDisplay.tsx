import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircleIcon, LightBulbIcon, StarIcon, DownloadIcon } from './icons';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 55; // 2 * pi * r
  const offset = circumference - (score / 100) * circumference;
  
  let strokeColor = 'stroke-green-500';
  if (score < 50) strokeColor = 'stroke-red-500';
  else if (score < 75) strokeColor = 'stroke-yellow-500';

  return (
    <div className="relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48">
      <svg className="absolute w-full h-full transform -rotate-90">
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r="55"
          cx="50%"
          cy="50%"
        />
        <circle
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="55"
          cx="50%"
          cy="50%"
        />
      </svg>
      <div className="text-center">
        <span className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white">{score}</span>
        <p className="text-sm text-slate-500 dark:text-slate-400">Pontos</p>
      </div>
    </div>
  );
};


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const handleDownload = () => {
    // Sanitize job title for filename
    const sanitizedTitle = (result.jobTitle || 'analise').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `analise_curriculo_${sanitizedTitle}.txt`;

    // Format the content for the text file
    const fileContent = `
Análise de Compatibilidade - Robô Recrutador IA
=================================================

Vaga: ${result.jobTitle}
Data da Análise: ${new Date().toLocaleString()}

-------------------------------------------------
PONTUAÇÃO DE COMPATIBILIDADE: ${result.compatibilityScore} / 100
-------------------------------------------------

HABILIDADES EM COMUM:
${result.commonSkills.length > 0 ? result.commonSkills.map(skill => `- ${skill}`).join('\n') : 'Nenhuma habilidade em comum identificada.'}

-------------------------------------------------

SUGESTÕES DE MELHORIA:
${result.improvementSuggestions.length > 0 ? result.improvementSuggestions.map(suggestion => `- ${suggestion}`).join('\n') : 'Nenhuma sugestão de melhoria específica.'}
    `;

    // Create a blob and trigger the download
    const blob = new Blob([fileContent.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Resultado da Análise</h2>
        <button 
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors"
          aria-label="Baixar análise como arquivo de texto"
        >
          <DownloadIcon className="w-5 h-5" />
          Baixar Análise
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/50 rounded-xl h-full">
            <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">Pontuação de Compatibilidade</h3>
            <ScoreCircle score={result.compatibilityScore} />
        </div>

        <div className="md:col-span-2 space-y-8">
            <div>
                <h3 className="flex items-center gap-3 text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">
                    <StarIcon className="w-7 h-7 text-yellow-500" />
                    Habilidades em Comum
                </h3>
                {result.commonSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                    {result.commonSkills.map((skill, index) => (
                        <span key={index} className="px-4 py-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-sm font-medium rounded-full shadow-sm">
                        {skill}
                        </span>
                    ))}
                    </div>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">Nenhuma habilidade em comum foi identificada com clareza.</p>
                )}
            </div>
            
            <div>
                <h3 className="flex items-center gap-3 text-xl font-semibold mb-4 text-slate-700 dark:text-slate-300">
                    <LightBulbIcon className="w-7 h-7 text-green-500" />
                    Sugestões de Melhoria
                </h3>
                {result.improvementSuggestions.length > 0 ? (
                    <ul className="space-y-3 list-none">
                    {result.improvementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 bg-slate-100/50 dark:bg-slate-900/30 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300 text-base">{suggestion}</span>
                        </li>
                    ))}
                    </ul>
                ) : (
                     <p className="text-slate-500 dark:text-slate-400">Nenhuma sugestão de melhoria específica no momento. Parece um bom currículo!</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;