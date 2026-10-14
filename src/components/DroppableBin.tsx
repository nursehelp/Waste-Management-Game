import { useDroppable } from '@dnd-kit/core';
import { BinDefinition } from '../data/bins';
import { motion } from 'motion/react';
import React from 'react';

interface DroppableBinProps {
  bin: BinDefinition;
  isCorrectDrop?: boolean;
  isWrongDrop?: boolean;
}

export function DroppableBin({ bin, isCorrectDrop, isWrongDrop }: DroppableBinProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: bin.id,
  });

  const isTiger = bin.id === 'Tiger';
  
  const baseBg = isTiger ? 'bg-yellow-400' : bin.colorClass;
  const stripeStyle = isTiger ? {
    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 12px, #000 12px, #000 24px)'
  } : {};

  return (
    <motion.div
      ref={setNodeRef}
      className={`relative w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-38 rounded-t-xl rounded-b-md shadow-md flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all duration-150 select-none ${
        isOver && !isCorrectDrop && !isWrongDrop ? 'scale-110 shadow-2xl z-20 ring-4 ring-blue-400' : ''
      } ${
        isCorrectDrop ? 'ring-4 ring-green-500 shadow-xl shadow-green-500/50 scale-105' : ''
      } ${
        isWrongDrop ? 'ring-4 ring-red-500 shadow-xl shadow-red-500/50' : ''
      }`}
      animate={
        isCorrectDrop ? { scale: [1, 1.1, 1] } : 
        isWrongDrop ? { x: [-8, 8, -8, 8, 0] } : {}
      }
      transition={{ duration: 0.3 }}
      style={{
        ...(!isTiger ? {} : { backgroundColor: '#facc15' })
      }}
    >
      <div className={`absolute inset-0 rounded-t-xl rounded-b-md opacity-95 ${baseBg}`} style={stripeStyle} />
      
      {/* Bin Cap / Top Rim */}
      <div className="relative z-10 w-full h-2.5 sm:h-3 rounded-full bg-black/20 mb-1 border-b border-black/10" />

      {/* Bin Label */}
      <div className="relative z-10 bg-white/95 px-1 py-1 rounded-md shadow-sm text-center font-extrabold text-[0.68rem] sm:text-xs text-slate-800 border border-slate-300 w-full flex flex-col items-center justify-center leading-tight min-h-[38px]">
        <span>{bin.name}</span>
        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 mt-0.5">
          £{bin.costPerTonne}/t
        </span>
      </div>
      
      {/* Correct / Incorrect animation overlays */}
      {isCorrectDrop && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-600 text-white rounded-full p-2 shadow-lg"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </motion.div>
        </div>
      )}
      
      {isWrongDrop && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-600 text-white rounded-full p-2 shadow-lg"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

