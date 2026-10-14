import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, ExternalLink, Users, AlertCircle, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppIcon({ className = "w-5 h-5", size }: { className?: string; size?: number }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width={size || 20} 
      height={size || 20} 
      fill="currentColor" 
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.486-8.414z" />
    </svg>
  );
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Use the canonical production link or current host
  const appUrl = typeof window !== 'undefined' && window.location.origin.includes('localhost')
    ? 'https://wastemanagementgame.vercel.app'
    : (typeof window !== 'undefined' ? window.location.origin : 'https://wastemanagementgame.vercel.app');

  const shareMessage = `🏥 *Hospital Clinical Waste Segregation Training Challenge* ♻️

Hi team! Please take 2 minutes to complete our interactive hospital waste segregation training game.

⚠️ *Important:* Please play the game **TWICE (Round 1 & Round 2)**!
Playing twice allows our hospital audit system to record your baseline vs post-training score, tracking our ward's progress and showing how effective the training tool is.

👉 *Play the game now:*
${appUrl}

100% anonymous • Takes only ~2 minutes • Helps our hospital cut fines and stay compliant!`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 text-left flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#25D366] via-emerald-600 to-[#128C7E] p-4 sm:p-5 text-white flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <WhatsAppIcon size={22} className="text-white" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-100 block">
                  Staff Invite & Audit CTA
                </span>
                <h3 className="text-lg font-black leading-tight text-white">
                  Invite Staff via WhatsApp
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
            {/* Call to Action Banner explaining why 2 plays are requested */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5 font-black text-sm">
                2x
              </div>
              <div className="text-xs text-emerald-950 leading-relaxed">
                <strong className="text-emerald-900 block font-bold mb-0.5">
                  Pre-typed WhatsApp message invites staff to play twice
                </strong>
                The invite specifically asks staff to play <strong>Round 1 (Baseline)</strong> and <strong>Round 2 (Post-Training)</strong> so our audit measures knowledge progression and tracks how effective the training tool is.
              </div>
            </div>

            {/* Direct WhatsApp Action Button (Primary CTA) */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <WhatsAppIcon size={20} className="text-white shrink-0" />
              <span>Send Invite in WhatsApp</span>
              <ExternalLink size={16} className="opacity-80 ml-0.5" />
            </a>

            {/* Auto-typed Message Preview Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Pre-typed WhatsApp Message Preview:
                </label>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs font-bold text-[#005eb8] hover:text-[#004080] flex items-center gap-1 transition-colors"
                >
                  {copiedMessage ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto select-all">
                {shareMessage}
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                {copiedMessage ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedMessage ? 'Message Copied!' : 'Copy Full Message'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link Only'}</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
