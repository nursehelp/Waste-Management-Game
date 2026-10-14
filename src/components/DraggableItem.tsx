import { useDraggable } from '@dnd-kit/core';
import { WasteItem } from '../data/inventory';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import React from 'react';

interface DraggableItemProps {
  item: WasteItem;
  disabled?: boolean;
}

export function DraggableItem({ item, disabled }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
    disabled
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
      className={`touch-none relative flex items-center justify-center p-3 sm:p-5 md:p-6 bg-white border-2 sm:border-4 border-slate-200 rounded-2xl shadow-lg sm:shadow-xl w-[260px] sm:w-[320px] md:w-[380px] min-h-[90px] sm:min-h-[110px] md:min-h-[130px] cursor-grab select-none transition-shadow ${
        isDragging ? 'opacity-80 scale-105 z-50 cursor-grabbing shadow-2xl border-blue-500 ring-4 ring-blue-200' : 'hover:border-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {!disabled && (
        <div className="absolute left-2.5 text-slate-400 hidden sm:block">
          <GripVertical size={20} />
        </div>
      )}
      <div className="text-center sm:ml-4 px-2">
        <h3 className="font-extrabold text-base sm:text-lg md:text-xl text-slate-800 leading-snug">
          {item.name}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            📍 {item.scenario}
          </span>
          {item.isCommonMistake && (
            <span className="text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              ⚠️ High-Risk Item
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

