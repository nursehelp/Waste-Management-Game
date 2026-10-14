import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, BarChart3, Sparkles, ShieldCheck } from 'lucide-react';
import { WasteItem, getUniqueScenarios } from '../data/inventory';
import { ShareModal, WhatsAppIcon } from './ShareModal';

interface StartScreenProps {
  inventory: WasteItem[];
  onStart: (scenario: string) => void;
  onOpenAudit: () => void;
}

export function StartScreen({ inventory, onStart, onOpenAudit }: StartScreenProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const scenarios = getUniqueScenarios(inventory);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#f0f4f8] text-slate-900 p-3 sm:p-6 font-sans relative overflow-x-hidden selection:bg-blue-700 selection:text-white">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#005eb8]" />

      {/* Top Header Controls */}
      <header className="w-full max-w-5xl flex items-center justify-between gap-2 py-3 px-1 z-20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#005eb8] flex items-center justify-center font-black text-white text-base shadow-sm">
            🏥
          </div>
          <span className="font-bold text-sm tracking-wide text-slate-800 hidden sm:inline">
            Hospital Waste Segregation Training
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/90 active:bg-emerald-200 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-95"
            title="Invite staff on WhatsApp to play twice for audit tracking"
          >
            <WhatsAppIcon size={15} className="text-[#25D366] shrink-0" />
            <span className="hidden xs:inline">Invite Staff (WhatsApp)</span>
            <span className="xs:hidden">Invite</span>
          </button>

          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 bg-[#005eb8] hover:bg-[#004d99] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-95"
          >
            <BarChart3 size={14} />
            <span>Audit</span>
          </button>
        </div>
      </header>

      {/* Hero Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="z-10 bg-white border border-slate-200 p-6 sm:p-9 md:p-11 rounded-3xl max-w-4xl w-full text-center mt-3 shadow-xl"
      >
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full text-[#005eb8] font-extrabold tracking-widest text-[11px] sm:text-xs uppercase mb-4">
          <Sparkles size={14} className="text-[#005eb8]" /> Clinical Waste Segregation Simulation
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 sm:mb-4 leading-tight text-[#002f6c]">
          Hospital Waste Segregation Game
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 max-w-2xl mx-auto font-medium leading-relaxed">
          Quick 2-minute scenario game to practice disposing of clinical waste correctly, avoid expensive compliance fines, and measure your knowledge increment.
        </p>

        {/* Audit Stats Banner */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto mb-7 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase block">Method</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#005eb8]">Interactive</span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase block">Target Time</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-700">~2 Minutes</span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase block">Audit</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-800">100% Anonymous</span>
          </div>
        </div>

        {/* Scenario Selection Grid */}
        <div className="text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-slate-900 font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span>Select Ward Scenario to Begin</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">10 items per round</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Primary 'All / Mixed Scenarios' button */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStart('All')}
              className="bg-[#005eb8] hover:bg-[#004d99] text-white flex items-center justify-between p-4 rounded-2xl font-bold shadow-md shadow-blue-500/20 border border-blue-400 transition-all text-left"
            >
              <div>
                <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-wider block">Recommended</span>
                <span className="text-base font-extrabold text-white">Mixed Hospital Wards</span>
                <span className="text-xs text-blue-100 block mt-0.5">All scenarios combined</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Play size={18} className="fill-white" />
              </div>
            </motion.button>
              
            {scenarios.map(scen => (
              <motion.button 
                key={scen}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStart(scen)}
                className="bg-slate-100 hover:bg-slate-200/80 text-slate-900 flex items-center justify-between p-4 rounded-2xl font-bold transition-all border border-slate-300 text-left"
              >
                <div>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Scenario</span>
                  <span className="text-sm sm:text-base font-bold text-slate-800 line-clamp-1">{scen}</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#005eb8] shadow-xs">
                  <Play size={14} className="fill-[#005eb8]" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Audit Portal Teaser */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-left font-medium">
            <ShieldCheck size={16} className="text-[#005eb8] shrink-0" />
            <span>Review waste segregation knowledge increments and cloud audit logs in real-time.</span>
          </div>
          <button
            onClick={onOpenAudit}
            className="text-[#005eb8] hover:underline font-bold flex items-center gap-1"
          >
            Open Audit →
          </button>
        </div>

      </motion.div>

      {/* WhatsApp Staff Invite & Audit Tracking Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </div>
  );
}
