export type BinType = 'Yellow sharp' | 'Orange' | 'Tiger' | 'Blue' | 'Black' | 'Clear' | 'Food waste';

export interface BinDefinition {
  id: BinType;
  name: string;
  colorClass: string;
  costPerTonne: number;
}

export const BINS: Record<BinType, BinDefinition> = {
  'Yellow sharp': { id: 'Yellow sharp', name: 'Yellow sharp', colorClass: 'bg-yellow-400 border-yellow-500 text-black', costPerTonne: 1022 },
  Orange: { id: 'Orange', name: 'Orange', colorClass: 'bg-orange-500 border-orange-600 text-white', costPerTonne: 519 },
  Tiger: { 
    id: 'Tiger', 
    name: 'Tiger', 
    // we will use a custom style for stripes in the component
    colorClass: 'bg-yellow-400 border-yellow-500 text-black', 
    costPerTonne: 389 
  },
  Blue: { id: 'Blue', name: 'Blue', colorClass: 'bg-blue-600 border-blue-700 text-white', costPerTonne: 1022 },
  Black: { id: 'Black', name: 'Black', colorClass: 'bg-slate-800 border-slate-900 text-white', costPerTonne: 140 },
  Clear: { id: 'Clear', name: 'Clear', colorClass: 'bg-white border-slate-300 text-slate-800', costPerTonne: 90 },
  'Food waste': { id: 'Food waste', name: 'Food waste', colorClass: 'bg-emerald-600 border-emerald-700 text-white', costPerTonne: 80 },
};
