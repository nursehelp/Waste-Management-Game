import React, { useState } from 'react';
import { GameResults } from './Game';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCcw, 
  LayoutGrid, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Home
} from 'lucide-react';
import { ShareModal, WhatsAppIcon } from './ShareModal';

interface SummaryProps {
  results: GameResults;
  round1Results?: GameResults | null;
  onRestart: () => void;
  onNewScenarios: () => void;
  onExit: () => void;
  attemptType: '1st Attempt' | '2nd Attempt';
}

export function SummaryScreen({
  results,
  round1Results,
  onRestart,
  onNewScenarios,
  onExit,
  attemptType
}: SummaryProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showAbandonWarningModal, setShowAbandonWarningModal] = useState(false);
  const [pendingExitAction, setPendingExitAction] = useState<'exit' | 'newScenario' | null>(null);

  const isFirstAttempt = attemptType === '1st Attempt';

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-3 sm:p-6 bg-[#f0f4f8] font-sans text-slate-900 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-300 rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-xl text-center"
      >
        {/* Top Status Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {isFirstAttempt ? (
            <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
              <AlertTriangle size={14} className="text-rose-600" /> 
              Step 1 of 2 Complete — Round 2 is Mandatory
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <CheckCircle2 size={14} className="text-emerald-600" /> 
              Audit Verified: Both Rounds Logged
            </div>
          )}
          
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#005eb8] border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} className="text-[#005eb8]" /> 
            {attemptType} Registered
          </div>
        </div>

        {/* Intimidating Mandatory Round 2 Callout for 1st Attempt */}
        {isFirstAttempt ? (
          <div className="bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100 border-2 border-rose-500 rounded-2xl p-4 sm:p-5 mb-5 text-left shadow-md">
            <div className="flex items-start gap-3">
              <div className="bg-rose-600 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm animate-pulse">
                <ShieldAlert size={26} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="bg-rose-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide animate-pulse">
                    🚨 MANDATORY AUDIT PROTOCOL
                  </span>
                  <span className="text-xs font-bold text-rose-900">
                    Hospital Compliance Requirement
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-rose-950 leading-snug mb-1">
                  You Must Complete Round 2 Now!
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  Hospital waste management policy requires <strong>every staff member to complete BOTH rounds</strong>. 
                  Leaving after Round 1 provides zero audit value and will flag your session as 
                  <strong className="text-rose-900"> &ldquo;INCOMPLETE / NON-COMPLIANT&rdquo;</strong> in the central audit database. 
                  Please proceed immediately to Round 2 to validate your score improvement.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 mb-5 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-600 text-white p-2 rounded-xl shrink-0 mt-0.5">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-700 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wide">
                    ✅ Audit Requirement Fulfilled
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 leading-tight mb-1">
                  Staff Training Cycle Complete!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                  Both your <strong>1st Attempt (Baseline)</strong> and <strong>2nd Attempt (Repeat)</strong> have been officially recorded in the Hospital Cloud Audit registry. Your progress and retention data are validated.
                </p>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-black text-[#002f6c] mb-1 tracking-tight">
          {isFirstAttempt ? 'Round 1 Results (Baseline Assessment)' : 'Round 2 Results (Repeat Evaluation)'}
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-600 mb-5 font-medium">
          {isFirstAttempt 
            ? 'Review your mistakes below, then start Mandatory Round 2 to prove your knowledge retention.' 
            : 'Excellent work! Compare your 1st vs 2nd round scores below to see your progression.'}
        </p>

        {/* Side-by-Side Progression Card on Round 2 */}
        {!isFirstAttempt && round1Results && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 text-left shadow-sm">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#005eb8] uppercase tracking-wider mb-2.5">
              <TrendingUp size={16} />
              Audit Progression Analysis (Pre vs Post)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block">Round 1 (Baseline)</span>
                <span className="text-lg font-black text-slate-800 font-mono">{round1Results.accuracyPercent}%</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block">Round 2 (Repeat)</span>
                <span className="text-lg font-black text-emerald-700 font-mono">{results.accuracyPercent}%</span>
              </div>
              <div className={`p-2.5 rounded-xl shadow-xs flex flex-col justify-center items-center ${
                results.accuracyPercent >= round1Results.accuracyPercent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}>
                <span className="text-[10px] font-extrabold uppercase block opacity-90">Improvement</span>
                <span className="text-lg font-black font-mono">
                  {results.accuracyPercent - round1Results.accuracyPercent >= 0 
                    ? `+${results.accuracyPercent - round1Results.accuracyPercent}%` 
                    : `${results.accuracyPercent - round1Results.accuracyPercent}%`}
                </span>
              </div>
            </div>
          </div>
        )}

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
                {isFirstAttempt 
                  ? `Review Incorrect Placements Before Mandatory Round 2 (${results.mistakes.length})` 
                  : `Review Incorrect Placements (${results.mistakes.length})`}
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
          {isFirstAttempt ? (
            /* First Attempt: Intimidating, Mandatory Round 2 Prominence */
            <>
              <button 
                onClick={onRestart} 
                className="sm:col-span-2 group relative overflow-hidden bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-800 text-white p-4 sm:p-5 rounded-2xl font-black text-base sm:text-lg transition-all shadow-xl hover:shadow-rose-400/50 active:scale-[0.99] border-2 border-rose-300 flex items-center justify-center gap-3 animate-pulse cursor-pointer"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white shrink-0">
                  <Play size={18} fill="currentColor" />
                </span>
                <span className="text-center">
                  START MANDATORY ROUND 2 NOW
                  <span className="block text-xs font-semibold text-rose-100 opacity-95">
                    ⚠️ Required by Hospital Audit Policy to complete session
                  </span>
                </span>
                <ArrowRight size={20} className="shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => {
                  setPendingExitAction('newScenario');
                  setShowAbandonWarningModal(true);
                }} 
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 p-3 rounded-xl font-bold text-xs transition-colors"
              >
                <Lock size={14} className="text-slate-400" /> 
                <span>Change Scenario (Locked)</span>
              </button>

              <button 
                onClick={() => {
                  setPendingExitAction('exit');
                  setShowAbandonWarningModal(true);
                }} 
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 p-3 rounded-xl font-bold text-xs transition-colors"
              >
                <Lock size={14} className="text-slate-400" /> 
                <span>Exit to Home (Locked)</span>
              </button>
            </>
          ) : (
            /* Second Attempt: Full Navigation Unlocked */
            <>
              <button 
                onClick={onRestart} 
                className="flex items-center justify-center gap-2 bg-[#005eb8] hover:bg-[#004d99] text-white p-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98"
              >
                <RefreshCcw size={16} /> 
                Start New Session (Fresh Staff Member)
              </button>
              
              <button 
                onClick={onNewScenarios} 
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 p-3.5 rounded-xl font-bold text-sm transition-colors active:scale-98"
              >
                <LayoutGrid size={16} /> Change Scenario
              </button>

              <button 
                onClick={onExit} 
                className="sm:col-span-2 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 p-3.5 rounded-xl font-bold text-sm transition-colors active:scale-98"
              >
                <Home size={16} /> Exit to Home Screen
              </button>
            </>
          )}

          <button 
            onClick={() => setIsShareModalOpen(true)} 
            className="sm:col-span-2 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl flex items-center justify-center gap-2 py-2.5 font-bold transition-all active:scale-98"
          >
            <WhatsAppIcon size={15} className="text-[#25D366]" /> 
            <span>Invite Team on WhatsApp (Ask Staff to Play Twice)</span>
          </button>
        </div>
      </motion.div>

      {/* Intimidation Modal when User attempts to Abandon before completing Round 2 */}
      <AnimatePresence>
        {showAbandonWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5 border border-rose-300">
                <ShieldAlert size={32} />
              </div>
              
              <span className="inline-block bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black uppercase px-3 py-1 rounded-full mb-2">
                ⚠️ NON-COMPLIANCE AUDIT WARNING
              </span>

              <h3 className="text-xl font-black text-rose-950 mb-1.5">
                Do NOT Abandon the Audit!
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-700 font-medium mb-4 leading-relaxed">
                Hospital compliance requires <strong>Round 2 (Post-Training Evaluation)</strong>. There is no audit value if you leave after only the 1st game.
              </p>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 mb-5 text-left text-xs space-y-2 text-rose-950">
                <div className="flex items-start gap-2 font-bold">
                  <span className="text-rose-600 mt-0.5">❌</span>
                  <span>Session will be recorded as <strong>ABANDONED / INCOMPLETE</strong>.</span>
                </div>
                <div className="flex items-start gap-2 font-bold">
                  <span className="text-rose-600 mt-0.5">❌</span>
                  <span>Your Round 1 score cannot be validated without Round 2 comparison.</span>
                </div>
                <div className="flex items-start gap-2 font-bold">
                  <span className="text-rose-600 mt-0.5">❌</span>
                  <span>You will have to restart the complete training from the beginning.</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setShowAbandonWarningModal(false);
                    onRestart(); // Immediately starts mandatory Round 2
                  }}
                  className="w-full bg-[#005eb8] hover:bg-[#004d99] text-white py-3.5 px-4 rounded-xl font-black text-sm shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={16} fill="currentColor" /> Play Mandatory Round 2 Now (Recommended)
                </button>

                <button
                  onClick={() => setShowAbandonWarningModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Return to Review My Mistakes
                </button>

                <button
                  onClick={() => {
                    setShowAbandonWarningModal(false);
                    if (pendingExitAction === 'exit') onExit();
                    else if (pendingExitAction === 'newScenario') onNewScenarios();
                  }}
                  className="w-full text-rose-600 hover:text-rose-800 text-xs font-semibold py-1.5 underline decoration-rose-400 cursor-pointer"
                >
                  I acknowledge non-compliance — Abandon audit and exit anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </div>
  );
}
