import React, { useState } from 'react';
import { AnalyticsSummary } from '../types/audit';
import { fetchAuditAnalytics, verifyAuditPin, resetAuditData, getAuditCsvDownloadUrl } from '../services/auditApi';
import { 
  ShieldCheck, 
  Trash2, 
  ArrowLeft, 
  TrendingUp, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  KeyRound, 
  Lock, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';

interface AuditDashboardProps {
  onBack: () => void;
  onManageItems?: () => void;
}

export function AuditDashboard({ onBack, onManageItems }: AuditDashboardProps) {
  // Always starts unauthenticated to enforce PIN every time the audit page is opened
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [verifiedPin, setVerifiedPin] = useState('');

  // Wipe Modal State
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipePin, setWipePin] = useState('');
  const [wipeError, setWipeError] = useState('');
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccessMsg, setWipeSuccessMsg] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    setIsVerifying(true);

    try {
      const isValid = await verifyAuditPin(pin.trim());
      if (isValid) {
        setIsAuthenticated(true);
        setVerifiedPin(pin.trim());
        setIsLoadingData(true);
        const data = await fetchAuditAnalytics(pin.trim());
        setAnalytics(data);
        setIsLoadingData(false);
      } else {
        setAuthError('Incorrect PIN code. Please enter the authorized PIN.');
      }
    } catch {
      setAuthError('Connection error while validating PIN. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRefresh = async () => {
    if (!verifiedPin) return;
    setIsLoadingData(true);
    try {
      const data = await fetchAuditAnalytics(verifiedPin);
      setAnalytics(data);
    } catch {
      // Ignored
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExecuteWipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setWipeError('');
    
    if (!wipePin.trim()) {
      setWipeError('Please enter the authorized PIN to confirm.');
      return;
    }

    setIsWiping(true);
    try {
      await resetAuditData(wipePin.trim());
      setShowWipeModal(false);
      setWipePin('');
      setWipeSuccessMsg('All audit records have been permanently wiped. Starting fresh.');
      
      // Refresh analytics to 0
      const freshData = await fetchAuditAnalytics(verifiedPin);
      setAnalytics(freshData);
    } catch {
      setWipeError('Incorrect PIN or unable to wipe data. Please verify your PIN.');
    } finally {
      setIsWiping(false);
    }
  };

  // 1. LOCKED VIEW - ALWAYS REQUIRES PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#f0f4f8] p-4 font-sans text-slate-900">
        <div className="bg-white p-7 sm:p-9 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 text-center">
          <div className="w-14 h-14 bg-blue-50 text-[#005eb8] border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Lock size={28} />
          </div>

          <h2 className="text-2xl font-black text-[#002f6c] mb-1 tracking-tight">Audit Portal Access</h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium">
            Enter the authorized PIN code to review staff waste segregation audits and score increment reports.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <input 
                  type="password" 
                  value={pin} 
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Enter PIN"
                  autoFocus
                  className="w-full border-2 border-slate-300 focus:border-[#005eb8] focus:ring-2 focus:ring-blue-100 p-3.5 rounded-xl text-center text-lg font-bold tracking-widest outline-hidden transition-all"
                />
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {authError && (
                <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold mt-2.5 text-left bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isVerifying || !pin.trim()}
              className="w-full bg-[#005eb8] hover:bg-[#004d99] disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98"
            >
              {isVerifying ? 'Verifying PIN...' : 'Access Audit Dashboard'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
            <button 
              onClick={onBack} 
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 hover:underline"
            >
              <ArrowLeft size={14} /> Back to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED AUDIT DASHBOARD VIEW
  const first = analytics?.firstAttempt || { count: 0, avgAccuracy: 0, avgWastedCost: 0, avgScore: 0 };
  const second = analytics?.secondAttempt || { count: 0, avgAccuracy: 0, avgWastedCost: 0, avgScore: 0 };
  const hasBothAttempts = first.count > 0 && second.count > 0;
  const improvement = analytics?.accuracyImprovement || (hasBothAttempts ? second.avgAccuracy - first.avgAccuracy : 0);

  return (
    <div className="min-h-[100dvh] bg-[#f0f4f8] text-slate-900 font-sans p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-emerald-300">
                Verified Manager Session
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#002f6c] tracking-tight">
              Hospital Waste Segregation Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Quantitative comparison of staff waste segregation knowledge: 1st Attempt vs 2nd Attempt
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleRefresh}
              disabled={isLoadingData}
              title="Refresh audit data"
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
            >
              <RefreshCw size={14} className={isLoadingData ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {onManageItems && (
              <button 
                onClick={onManageItems}
                title="Manage waste segregation items inventory"
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
              >
                <span>Manage Items</span>
              </button>
            )}

            <a 
              href={getAuditCsvDownloadUrl(verifiedPin)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 transition-colors"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </a>

            <button 
              onClick={() => {
                setWipeError('');
                setWipePin('');
                setShowWipeModal(true);
              }}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <Trash2 size={14} />
              <span>Wipe All Data</span>
            </button>

            <button 
              onClick={onBack}
              className="flex items-center gap-1 bg-[#005eb8] hover:bg-[#004d99] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>Exit Audit</span>
            </button>
          </div>
        </header>

        {/* Wipe Success Alert Banner */}
        {wipeSuccessMsg && (
          <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
              <span>{wipeSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setWipeSuccessMsg('')} 
              className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 rounded-md hover:bg-emerald-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* PRIMARY HIGHLIGHT: 1ST ATTEMPT vs 2ND ATTEMPT ACCURACY COMPARISON */}
        <div className="bg-white border border-slate-200 p-5 sm:p-7 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#005eb8]">
                Key Audit Findings
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                1st Attempt Accuracy vs. 2nd Attempt Accuracy
              </h2>
            </div>
            
            {hasBothAttempts && (
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold text-xs">
                <TrendingUp size={16} className="text-emerald-600" />
                <span>Knowledge Increment: <strong>{improvement >= 0 ? `+${improvement}%` : `${improvement}%`}</strong></span>
              </div>
            )}
          </div>

          {/* TWO PRIMARY DATA METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* 1ST ATTEMPT ACCURACY CARD */}
            <div className="bg-blue-50/70 border-2 border-blue-200 p-5 sm:p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-[#005eb8] text-xs font-black uppercase px-2.5 py-1 rounded-lg">
                  Round 1 (Baseline)
                </span>
                <span className="text-xs text-slate-500 font-semibold font-mono">
                  {first.count} {first.count === 1 ? 'audit logged' : 'audits logged'}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  1st Attempt Accuracy
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-[#002f6c] tracking-tight">
                    {first.count > 0 ? `${first.avgAccuracy}%` : 'No Data'}
                  </span>
                  {first.count > 0 && (
                    <span className="text-xs text-slate-600 font-bold">
                      (avg {first.avgScore}/10 correct)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-blue-200/80 rounded-full h-3 mb-3 overflow-hidden">
                <div 
                  className="bg-[#005eb8] h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, first.avgAccuracy)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700 font-medium pt-2 border-t border-blue-200/60">
                <span>Avg Financial Risk:</span>
                <strong className={first.avgWastedCost > 0 ? 'text-rose-700' : 'text-slate-800'}>
                  £{first.avgWastedCost} / tonne
                </strong>
              </div>
            </div>

            {/* 2ND ATTEMPT ACCURACY CARD */}
            <div className="bg-emerald-50/70 border-2 border-emerald-200 p-5 sm:p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black uppercase px-2.5 py-1 rounded-lg">
                  Round 2 (Repeat Training)
                </span>
                <span className="text-xs text-slate-500 font-semibold font-mono">
                  {second.count} {second.count === 1 ? 'audit logged' : 'audits logged'}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  2nd Attempt Accuracy
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-emerald-900 tracking-tight">
                    {second.count > 0 ? `${second.avgAccuracy}%` : 'Pending 2nd Rounds'}
                  </span>
                  {second.count > 0 && (
                    <span className="text-xs text-slate-600 font-bold">
                      (avg {second.avgScore}/10 correct)
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-emerald-200/80 rounded-full h-3 mb-3 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, second.avgAccuracy)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700 font-medium pt-2 border-t border-emerald-200/60">
                <span>Avg Financial Risk:</span>
                <strong className="text-emerald-800">
                  £{second.avgWastedCost} / tonne
                </strong>
              </div>
            </div>

          </div>

          {/* SIDE-BY-SIDE QUANTITATIVE SUMMARY BANNER */}
          {hasBothAttempts ? (
            <div className="bg-gradient-to-r from-blue-50 via-white to-emerald-50 border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Proven Learning Impact: {improvement >= 0 ? `+${improvement}% Improvement` : `${improvement}% Change`}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Staff accuracy increased from <strong>{first.avgAccuracy}%</strong> on initial attempt to <strong>{second.avgAccuracy}%</strong> on repetition.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 uppercase font-bold block">Cost Penalty Reduced By</span>
                <span className="text-lg font-black text-emerald-700">
                  £{Math.max(0, first.avgWastedCost - second.avgWastedCost)} / tonne
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#005eb8] shrink-0" />
              <span>
                {first.count === 0 && second.count === 0 
                  ? 'No audits recorded yet. Staff members playing Round 1 and Round 2 will populate this dashboard in real-time.' 
                  : second.count === 0 
                    ? `1st attempt baseline recorded (${first.avgAccuracy}%). Complete Round 2 by clicking "Play Again" after the game to record 2nd attempt data.`
                    : 'Awaiting additional attempt records to compute paired progression.'}
              </span>
            </div>
          )}
        </div>

        {/* OVERALL KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Audits Captured
            </span>
            <span className="text-3xl font-black text-slate-900">
              {analytics?.totalAudited || 0}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Combined 1st & 2nd attempts
            </span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Overall Average Accuracy
            </span>
            <span className="text-3xl font-black text-[#005eb8]">
              {analytics?.avgAccuracy || 0}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Across all items sorted
            </span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Average Cost Risk
            </span>
            <span className={`text-3xl font-black ${(analytics?.avgWastedCost || 0) > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              £{analytics?.avgWastedCost || 0}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Per tonne misplacement fine
            </span>
          </div>
        </div>

        {/* TOP MISTAKE ITEMS (FAILURE POINTS) */}
        {analytics?.topMisclassifiedItems && analytics.topMisclassifiedItems.length > 0 && (
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-600" />
              <span>Common Waste Segregation Failure Points</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-2">Item Name</th>
                    <th className="py-2">Mistakes Count</th>
                    <th className="py-2">Common Wrong Bin</th>
                    <th className="py-2">Correct Bin</th>
                    <th className="py-2 text-right">Potential Financial Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.topMisclassifiedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">{item.itemName}</td>
                      <td className="py-2.5 font-semibold text-rose-700">{item.mistakeCount}</td>
                      <td className="py-2.5 text-rose-600 font-medium">{item.commonWrongBin}</td>
                      <td className="py-2.5 text-emerald-700 font-bold">{item.correctBin}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-800">£{item.totalRiskCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECENT AUDIT RECORDS TABLE */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Recent Audit Records</h3>
              <p className="text-xs text-slate-500">Individual logs with attempt classification</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              {analytics?.recentRecords.length || 0} entries
            </span>
          </div>

          {analytics?.recentRecords && analytics.recentRecords.length > 0 ? (
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-2">Date / Time</th>
                    <th className="py-2">Attempt Stage</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Accuracy</th>
                    <th className="py-2">Cost Risk</th>
                    <th className="py-2">Scenario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {analytics.recentRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-2.5 text-slate-600 font-mono text-[11px]">
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(rec.timestamp).toLocaleDateString()})
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          rec.attemptType === '2nd Attempt' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-blue-100 text-[#005eb8] border border-blue-300'
                        }`}>
                          {rec.attemptType}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">{rec.score} / {rec.totalItems}</td>
                      <td className="py-2.5">
                        <span className={`font-bold font-mono ${rec.accuracyPercent >= 80 ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {rec.accuracyPercent}%
                        </span>
                      </td>
                      <td className="py-2.5 font-mono">
                        <span className={rec.wastedCost > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                          £{rec.wastedCost}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600">{rec.scenario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No audit records saved yet. Play a round in the game to see entries appear here.
            </div>
          )}
        </div>

      </div>

      {/* WIPE AUDIT DATA CONFIRMATION MODAL - ALWAYS ASKS FOR PIN "42774252" */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Confirm Wipe All Audit Data
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
              This will permanently delete all 1st attempt and 2nd attempt records. To confirm this action, please enter the audit PIN:
            </p>

            <form onSubmit={handleExecuteWipe} className="space-y-4">
              <div>
                <input 
                  type="password"
                  value={wipePin}
                  onChange={(e) => {
                    setWipePin(e.target.value);
                    if (wipeError) setWipeError('');
                  }}
                  placeholder="Enter authorized PIN"
                  autoFocus
                  className="w-full border-2 border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 p-3 rounded-xl text-center font-bold tracking-widest text-lg outline-hidden"
                />

                {wipeError && (
                  <p className="text-xs text-rose-600 font-bold mt-2 text-left bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {wipeError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWipeModal(false)}
                  disabled={isWiping}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold p-3 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isWiping || !wipePin.trim()}
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold p-3 rounded-xl text-xs transition-colors shadow-md active:scale-98"
                >
                  {isWiping ? 'Wiping...' : 'Confirm Wipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
