import { BinType } from './bins';

export interface WasteItem {
  id: string;
  name: string;
  scenario: string;
  correctBin: BinType;
  message: string;
  isCommonMistake?: boolean;
}

const DEFAULT_WASTE_ITEMS: WasteItem[] = [
  // Patient Room
  { id: 'pr-1', name: 'Non-infectious PPE (Apron/Gloves)', scenario: 'Patient Room', correctBin: 'Tiger', message: 'Correct – non-infectious PPE belongs in Tiger waste.', isCommonMistake: true },
  { id: 'pr-2', name: 'Uncontaminated Dressings', scenario: 'Patient Room', correctBin: 'Tiger', message: 'Correct – uncontaminated dressings go in Tiger waste.' },
  { id: 'pr-3', name: 'Incontinence Pad', scenario: 'Patient Room', correctBin: 'Tiger', message: 'Correct – offensive hygiene waste goes in Tiger waste.' },
  { id: 'pr-4', name: 'Crisp Packet', scenario: 'Patient Room', correctBin: 'Black', message: 'Correct – mixed material food wrappers cannot be recycled.' },
  { id: 'pr-5', name: 'Paper Hand Towels', scenario: 'Patient Room', correctBin: 'Black', message: 'Correct – paper towels are non-recyclable.' },
  { id: 'pr-6', name: 'Infectious Blood-Soaked Dressing', scenario: 'Patient Room', correctBin: 'Orange', message: 'Correct – infectious soft waste goes in Orange bags.', isCommonMistake: true },

  // Toilet / Bathroom
  { id: 'tb-1', name: 'Sanitary Waste', scenario: 'Toilet / Bathroom', correctBin: 'Tiger', message: 'Correct – non-infectious sanitary waste goes in Tiger bags.' },
  { id: 'tb-2', name: 'Used Nappy', scenario: 'Toilet / Bathroom', correctBin: 'Tiger', message: 'Correct – offensive waste like nappies belong in Tiger bags.' },
  { id: 'tb-3', name: 'Non-infectious Wipes', scenario: 'Toilet / Bathroom', correctBin: 'Black', message: 'Correct – wipes cannot be recycled and go in Black bags.' },
  { id: 'tb-4', name: 'Paper Hand Towels', scenario: 'Toilet / Bathroom', correctBin: 'Black', message: 'Correct – paper towels must go in Black waste.' },

  // Medication Preparation Area
  { id: 'mp-1', name: 'Empty Medicine Vial (Glass)', scenario: 'Medication Preparation Area', correctBin: 'Blue', message: 'Correct – non-hazardous medicine vials go in Blue lidded bins.' },
  { id: 'mp-2', name: 'Empty Blister Pack', scenario: 'Medication Preparation Area', correctBin: 'Blue', message: 'Correct – blister packs are pharmaceutically contaminated.', isCommonMistake: true },
  { id: 'mp-3', name: 'Empty Saline IV Bag', scenario: 'Medication Preparation Area', correctBin: 'Tiger', message: 'Correct – non-medicinal IV bags go in Tiger waste, not infectious waste!', isCommonMistake: true },
  { id: 'mp-4', name: 'Expired Painkillers', scenario: 'Medication Preparation Area', correctBin: 'Blue', message: 'Correct – unwanted medicines go in Blue lidded bins.' },
  { id: 'mp-5', name: 'Used Syringe (Infected)', scenario: 'Medication Preparation Area', correctBin: 'Yellow sharp', message: 'Correct – infected sharps must go in the Yellow sharp bin.' },
  { id: 'mp-6', name: 'Needle', scenario: 'Medication Preparation Area', correctBin: 'Yellow sharp', message: 'Correct – sharps go in the Yellow sharp bin.' },
  { id: 'mp-7', name: 'Clean Medicine Box', scenario: 'Medication Preparation Area', correctBin: 'Clear', message: 'Correct – clean cardboard packaging can be recycled in Clear bags.' },

  // Kitchen
  { id: 'k-1', name: 'Banana Peel', scenario: 'Kitchen', correctBin: 'Food waste', message: 'Correct – food waste goes in the Food waste bin.' },
  { id: 'k-2', name: 'Clean Plastic Milk Jug', scenario: 'Kitchen', correctBin: 'Clear', message: 'Correct – rinsed plastic bottles can be recycled.' },
  { id: 'k-3', name: 'Empty Drinks Can', scenario: 'Kitchen', correctBin: 'Clear', message: 'Correct – clean cans go in Clear recycling bags.' },
  { id: 'k-4', name: 'Used Coffee Cup', scenario: 'Kitchen', correctBin: 'Black', message: 'Correct – paper coffee cups are lined with plastic and cannot be recycled.' },
  { id: 'k-5', name: 'Used Tea Bag', scenario: 'Kitchen', correctBin: 'Food waste', message: 'Correct – tea bags go in Food waste.' },

  // Staff Room
  { id: 'sr-1', name: 'Non-clinical Face Mask', scenario: 'Staff Room', correctBin: 'Black', message: 'Correct – masks worn in non-clinical areas go in black bags.', isCommonMistake: true },
  { id: 'sr-2', name: 'Clean Paper Packaging', scenario: 'Staff Room', correctBin: 'Clear', message: 'Correct – clean paper goes in the Clear recycling bag.', isCommonMistake: true },
  { id: 'sr-3', name: 'Plastic Water Bottle', scenario: 'Staff Room', correctBin: 'Clear', message: 'Correct – plastic bottles can be recycled.' },
  { id: 'sr-4', name: 'General Office Waste', scenario: 'Staff Room', correctBin: 'Black', message: 'Correct – general non-recyclable waste goes here.' }
];

export const getInventory = (): WasteItem[] => {
  try {
    const saved = localStorage.getItem('hospital_waste_inventory');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load inventory from local storage', e);
  }
  return DEFAULT_WASTE_ITEMS;
};

export const saveInventory = (items: WasteItem[]) => {
  localStorage.setItem('hospital_waste_inventory', JSON.stringify(items));
};

export const getUniqueScenarios = (items: WasteItem[]): string[] => {
  return Array.from(new Set(items.map(i => i.scenario))).sort();
};

export const getRandomItems = (items: WasteItem[], scenario: string, count: number = 10): WasteItem[] => {
  const pool = scenario === 'All' ? items : items.filter(item => item.scenario === scenario);

  const commonMistakes = pool.filter(item => item.isCommonMistake);
  const regularItems = pool.filter(item => !item.isCommonMistake);
  
  // Pick about 40% common mistakes
  const numMistakes = Math.min(Math.floor(count * 0.4), commonMistakes.length);
  const numRegular = Math.min(count - numMistakes, regularItems.length);

  const shuffledMistakes = [...commonMistakes].sort(() => 0.5 - Math.random());
  const shuffledRegular = [...regularItems].sort(() => 0.5 - Math.random());

  const selected = [
    ...shuffledMistakes.slice(0, numMistakes),
    ...shuffledRegular.slice(0, numRegular)
  ];

  return selected.sort(() => 0.5 - Math.random());
};
