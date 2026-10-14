import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { BinType, BINS } from '../data/bins';
import { WasteItem } from '../data/inventory';
import { DroppableBin } from './DroppableBin';
import { DraggableItem } from './DraggableItem';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Clock, Flame, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export interface GameMistake {
  itemName: string;
  chosenBin: string;
  correctBin: string;
  penalty: number;
}

export interface GameResults {
  score: number;
  totalItems: number;
  accuracyPercent: number;
  wastedCost: number;
  correct: number;
  incorrect: number;
  timeSpentSeconds: number;
  mistakes: GameMistake[];
  scenario: string;
}

interface GameProps {
  items: WasteItem[];
  scenario: string;
  attemptType?: '1st Attempt' | '2nd Attempt';
  onComplete: (results: GameResults) => void;
  onExit: () => void;
}

export function Game({ items, scenario, attemptType = '1st Attempt', onComplete, onExit }: GameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wastedCost, setWastedCost] = useState(0);
  const [mistakes, setMistakes] = useState<GameMistake[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string; costImpact?: string } | null>(null);
  const [activeItem, setActiveItem] = useState<WasteItem | null>(null);
  const [recentDropTarget, setRecentDropTarget] = useState<BinType | null>(null);
  const [isAnimatingDrop, setIsAnimatingDrop] = useState(false);

  // Time tracking
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsElapsed(s => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentItem = items[currentIndex];

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = () => {
    if (isAnimatingDrop) return;
    setActiveItem(currentItem);
    setFeedback(null);
    setRecentDropTarget(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { over } = event;
    
    if (over && currentItem && !isAnimatingDrop) {
      const droppedBinId = over.id as BinType;
      handleDrop(droppedBinId);
    }
  };

  // Mobile friendly direct bin click
  const handleBinClick = (binId: BinType) => {
    if (!isAnimatingDrop && currentItem) {
      handleDrop(binId);
    }
  };

  const handleDrop = (binId: BinType) => {
    setIsAnimatingDrop(true);
    setRecentDropTarget(binId);

    const isCorrect = currentItem.correctBin === binId;
    
    let updatedScore = score;
    let updatedWastedCost = wastedCost;
    let updatedMistakes = [...mistakes];

    if (isCorrect) {
      updatedScore = score + 1;
      setScore(updatedScore);
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      setFeedback({
        type: 'correct',
        message: currentItem.message,
      });

      if (newStreak >= 2) {
        confetti({
          particleCount: 50 + newStreak * 15,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } else {
      setStreak(0);
      const correctBinDef = BINS[currentItem.correctBin];
      const droppedBinDef = BINS[binId];
      
      const costDiff = droppedBinDef.costPerTonne - correctBinDef.costPerTonne;
      const penalty = Math.max(costDiff, 500);
      
      updatedWastedCost = wastedCost + penalty;
      setWastedCost(updatedWastedCost);

      const mistakeEntry: GameMistake = {
        itemName: currentItem.name,
        chosenBin: droppedBinDef.name,
        correctBin: correctBinDef.name,
        penalty
      };
      updatedMistakes.push(mistakeEntry);
      setMistakes(updatedMistakes);
      
      setFeedback({
        type: 'incorrect',
        message: `Incorrect – ${currentItem.name} should go in ${correctBinDef.name} waste, not ${droppedBinDef.name}.`,
        costImpact: `This error risks ~£${penalty}/t in compliance fine or excess treatment cost!`
      });
    }

    // Auto advance
    setTimeout(() => {
      setFeedback(null);
      setRecentDropTarget(null);
      setIsAnimatingDrop(false);
      
      if (currentIndex + 1 < items.length) {
        setCurrentIndex(i => i + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onComplete({
          score: updatedScore,
          totalItems: items.length,
          accuracyPercent: Math.round((updatedScore / items.length) * 100),
          wastedCost: updatedWastedCost,
          correct: updatedScore,
          incorrect: items.length - updatedScore,
          timeSpentSeconds: secondsElapsed,
          mistakes: updatedMistakes,
          scenario
        });
      }
    }, 2300);
  };

  // Cost Saver Meter percentage
  const greenThreshold = 1000;
  const amberThreshold = 3000;
  
  let meterColor = 'bg-rose-500';
  if (wastedCost <= greenThreshold) meterColor = 'bg-emerald-600';
  else if (wastedCost <= amberThreshold) meterColor = 'bg-amber-500';
  
  const meterWidth = Math.max(6, 100 - (wastedCost / 5000) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#f0f4f8] text-slate-900 font-sans select-none overflow-x-hidden">
      {/* NHS Blue Top Header Bar */}
      <header className="bg-[#005eb8] text-white shadow-md px-3 py-2.5 sm:px-6 sm:py-3 z-30 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Left: Back button + Scenario */}
          <div className="flex items-center justify-between md:justify-start gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-colors border border-white/20 cursor-pointer"
            >
              <ArrowLeft size={16} /> Exit
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                🏥 <span className="truncate max-w-[120px] sm:max-w-xs">{scenario === 'All' ? 'Mixed Scenarios' : scenario}</span>
              </span>
              {attemptType === '2nd Attempt' ? (
                <span className="bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                  ⚡ Round 2 of 2 (Mandatory)
                </span>
              ) : (
                <span className="bg-white/20 text-white font-bold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  🎯 Round 1 of 2 (Baseline)
                </span>
              )}
              <span className="text-xs bg-black/20 text-white px-2.5 py-0.5 rounded-md font-mono hidden md:inline-flex items-center gap-1">
                <Clock size={12} /> {formatTime(secondsElapsed)}
              </span>
            </div>
          </div>
          
          {/* Middle: Score & Streak */}
          <div className="flex items-center justify-between md:justify-center gap-3 sm:gap-6">
            <div className="text-xs sm:text-sm font-extrabold bg-white/15 text-white border border-white/20 px-3 sm:px-4 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <span>Item: {currentIndex + 1} / {items.length}</span>
              <span className="text-blue-200">|</span>
              <span className="text-emerald-300">Score: {score}</span>
            </div>
            
            <div className="text-xs sm:text-sm font-bold min-w-[90px] text-right md:text-center">
              {streak >= 2 ? (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-amber-300 flex items-center gap-1 justify-end md:justify-center font-black"
                >
                  <Flame size={16} className="text-amber-300 fill-amber-300" /> {streak} Streak!
                </motion.span>
              ) : (
                <span className="text-blue-100 text-xs font-semibold hidden sm:inline">Sort correctly!</span>
              )}
            </div>
          </div>

          {/* Right: Cost Saver Meter */}
          <div className="w-full md:w-60 flex flex-col justify-center">
            <div className="flex justify-between text-[11px] sm:text-xs font-bold mb-1 text-blue-100">
              <span className="flex items-center gap-1">
                <ShieldAlert size={12} className={wastedCost > 0 ? 'text-amber-300' : 'text-emerald-300'} />
                Cost Risk Penalty
              </span>
              <span className="font-mono font-black text-white">
                £{wastedCost}
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/20">
              <motion.div 
                className={`h-full ${meterColor}`}
                initial={{ width: '100%' }}
                animate={{ width: `${meterWidth}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Drag-and-Drop Area - Flexible Height */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 relative min-h-[220px] sm:min-h-[260px] overflow-hidden">
          
          <AnimatePresence mode="wait">
            {feedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                className={`p-4 sm:p-6 rounded-2xl shadow-xl max-w-lg w-full text-center border-2 ${
                  feedback.type === 'correct' 
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-emerald-500/10' 
                    : 'bg-rose-50 text-rose-950 border-rose-300 shadow-rose-500/10'
                }`}
              >
                <div className="text-xl sm:text-2xl font-black mb-2 flex justify-center items-center gap-2">
                  {feedback.type === 'correct' ? '✅ Correct Placement!' : '❌ Incorrect Waste Bin!'}
                </div>
                <p className="text-sm sm:text-base font-medium leading-relaxed">{feedback.message}</p>
                {feedback.costImpact && (
                  <div className="mt-3 text-rose-800 font-bold bg-rose-100 border border-rose-200 py-1.5 px-3 rounded-xl inline-block text-xs sm:text-sm">
                    ⚠️ {feedback.costImpact}
                  </div>
                )}
              </motion.div>
            ) : currentItem ? (
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', damping: 20 }}
                className="z-10 flex flex-col items-center"
              >
                <DraggableItem item={currentItem} disabled={isAnimatingDrop} />
                
                {/* Mobile & Desktop Prompt */}
                <div className="text-center mt-3 text-slate-600 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 bg-white px-4 py-1.5 rounded-full border border-slate-300 shadow-xs">
                  <span className="sm:hidden">👇 Tap a bin below OR drag</span>
                  <span className="hidden sm:inline">🖱️ Drag item to a bin OR click the matching bin below</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

        </main>

        {/* Bottom Section - Hospital Segregation Bins */}
        <section className="bg-white border-t border-slate-300 p-2.5 sm:p-4 z-20 shrink-0 shadow-inner">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <span>Select Waste Stream Bin</span>
                <span className="text-slate-500 font-normal">({Object.keys(BINS).length} standard bins)</span>
              </span>
              <span className="text-[11px] sm:text-xs text-[#005eb8] font-bold sm:hidden">
                Tap bin to sort
              </span>
            </div>

            {/* Bins Container */}
            <div className="overflow-x-auto pb-2 pt-1 flex sm:justify-center items-end gap-2 sm:gap-3.5 scrollbar-thin scrollbar-thumb-slate-300">
              {Object.values(BINS).map(bin => (
                <div 
                  key={bin.id} 
                  onClick={() => handleBinClick(bin.id)} 
                  className="cursor-pointer shrink-0 transition-transform active:scale-95 hover:-translate-y-1 focus:outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${bin.name} bin`}
                >
                  <DroppableBin 
                    bin={bin} 
                    isCorrectDrop={recentDropTarget === bin.id && currentItem?.correctBin === bin.id}
                    isWrongDrop={recentDropTarget === bin.id && currentItem?.correctBin !== bin.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Drag Overlay */}
        <DragOverlay zIndex={100}>
          {activeItem ? <DraggableItem item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-2 border-rose-400 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={26} />
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">
                Abandon Current Round?
              </h3>
              
              <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">
                {attemptType === '2nd Attempt' 
                  ? 'Round 2 is mandatory for audit verification! Exiting now will invalidate your audit record and mark this training session as incomplete.' 
                  : 'Leaving now will lose your current game progress and baseline audit data.'}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full bg-[#005eb8] hover:bg-[#004d99] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md active:scale-98 cursor-pointer"
                >
                  Continue Playing Round
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    onExit();
                  }}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Quit to Home (Abandon Round)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
