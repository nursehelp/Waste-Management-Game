import React from 'react';
import { GameResults } from './Game';
import { motion } from 'motion/react';
import { RefreshCcw, LayoutGrid, AlertCircle, Share2, ShieldCheck, TrendingUp } from 'lucide-react';

interface SummaryProps {
  results: GameResults;
  onRestart: () => void;
  onNewScenarios: () => void;
  onExit: () => void;
  attemptType: '1st Attempt' | '2nd Attempt';
}

export function SummaryScreen({
  results,
  onRestart,
  onNewScenarios,
  onExit,
  attemptType
}: SummaryProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFirstAttempt = attemptType === '1st Attempt';

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-3 sm:p-6 bg-[#f0f4f8] font-sans text-slate-900 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-300 rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-xl text-center"
      >
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#005eb8] border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck size={14} className="text-[#005eb8]" /> 
          Logged as {attemptType} in Cloud Audit
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-[#002f6c] mb-1 tracking-tight">
          {isFirstAttempt ? 'Round 1 Performance (Baseline)' : 'Round 2 Performance (Repeat)'}
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-600 mb-5 font-medium">
          {isFirstAttempt 
            ? 'Baseline waste segregation accuracy recorded. Play Round 2 to compare your score increment!' 
            : 'Second round completed! Your knowledge improvement has been logged for audit reporting.'}
        </p>

        {/* Breakdown Card */}
        <div className="space-y-3 mb-6 text-left bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-700 font-medium">🎯 Score & Accuracy:</span>
            <span className="font-bold text-slate-900 font-mono">
              {results.score} / {results.totalItems} ({results.accuracyPercent}%)
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-700 font-medium">✅ Correct Disposals:</span>
            <span className="font-bold text-emerald-700 font-mono">{results.correct}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-700 font-medium">❌ Incorrect Disposals:</span>
            <span className="font-bold text-rose-700 font-mono">{results.incorrect}</span>
          </div>

          <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
            <span className="text-slate-700 font-medium">💷 Potential Financial Risk:</span>
            <span className={`font-bold font-mono ${results.wastedCost > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              £{results.wastedCost} / tonne fine
            </span>
          </div>

          {results.mistakes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider mb-3">
                <AlertCircle size={15} className="text-amber-600" />
                Review Incorrect Placements ({results.mistakes.length})
              </h4>
              <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto pr-1">
                {results.mistakes.map((mistake, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-xs">
                    <p className="font-bold text-slate-900 mb-1.5">{mistake.itemName}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-700">
                      <span className="text-rose-700">❌ Placed in: <strong>{mistake.chosenBin}</strong></span>
                      <span className="text-emerald-800">✅ Correct: <strong>{mistake.correctBin}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={onRestart} 
            className="flex items-center justify-center gap-2 bg-[#005eb8] hover:bg-[#004d99] text-white p-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98"
          >
            <RefreshCcw size={16} /> 
            {isFirstAttempt ? 'Play Again (Round 2)' : 'Start New Session (Round 1)'}
          </button>
          
          <button 
            onClick={onNewScenarios} 
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 p-3.5 rounded-xl font-bold text-sm transition-colors active:scale-98"
          >
            <LayoutGrid size={16} /> Change Scenario
          </button>

          <button 
            onClick={onExit} 
            className="sm:col-span-2 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 p-3.5 rounded-xl font-bold text-sm transition-colors active:scale-98"
          >
            Exit to Home
          </button>

          <button 
            onClick={handleCopyLink} 
            className="sm:col-span-2 text-xs text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 py-1.5 font-semibold"
          >
            <Share2 size={13} /> {copied ? 'Copied training link!' : 'Share training link with hospital team'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
