import React, { useState } from 'react';
import { WasteItem } from '../data/inventory';
import { BinType, BINS } from '../data/bins';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminScreenProps {
  inventory: WasteItem[];
  onSave: (items: WasteItem[]) => void;
  onClose: () => void;
}

export function AdminScreen({ inventory, onSave, onClose }: AdminScreenProps) {
  const [items, setItems] = useState<WasteItem[]>([...inventory]);
  
  const [newName, setNewName] = useState('');
  const [newScenario, setNewScenario] = useState('');
  const [newBin, setNewBin] = useState<BinType>('Tiger');
  const [newMessage, setNewMessage] = useState('');
  const [newIsCommonMistake, setNewIsCommonMistake] = useState(false);

  const existingScenarios = Array.from(new Set(items.map(i => i.scenario))).sort();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newScenario || !newMessage) return;

    const newItem: WasteItem = {
      id: `custom-${Date.now()}`,
      name: newName,
      scenario: newScenario,
      correctBin: newBin,
      message: newMessage,
      isCommonMistake: newIsCommonMistake
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    onSave(newItems);

    setNewName('');
    setNewMessage('');
    setNewIsCommonMistake(false);
  };

  const handleDeleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    onSave(newItems);
  };

  const handleChangeBin = (id: string, newBin: BinType) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, correctBin: newBin } : item
    );
    setItems(newItems);
    onSave(newItems);
  };

  return (
    <div className="min-h-[100dvh] bg-[#f0f4f8] p-4 sm:p-6 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors font-semibold text-sm bg-white border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs"
          >
            <ArrowLeft size={18} /> Back to Audit
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#002f6c] tracking-tight">Manage Inventory</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8"
        >
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Add New Waste Item</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddItem}>
            <div>
              <label className="block text-sm font-semibold mb-1">Item Name</label>
              <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" className="w-full p-2 border rounded-lg" placeholder="e.g. Empty Hand Sanitizer" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Scenario</label>
              <input list="scenarios" required value={newScenario} onChange={e => setNewScenario(e.target.value)} type="text" className="w-full p-2 border rounded-lg" placeholder="Type or select a scenario" />
              <datalist id="scenarios">
                {existingScenarios.map(scen => <option key={scen} value={scen} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Correct Bin</label>
              <select value={newBin} onChange={e => setNewBin(e.target.value as BinType)} className="w-full p-2 border rounded-lg bg-white">
                {Object.values(BINS).map(bin => (
                  <option key={bin.id} value={bin.id}>{bin.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                <input type="checkbox" checked={newIsCommonMistake} onChange={e => setNewIsCommonMistake(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                Mark as Common Mistake
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Feedback Message (shown when placed correctly)</label>
              <input required value={newMessage} onChange={e => setNewMessage(e.target.value)} type="text" className="w-full p-2 border rounded-lg" placeholder="e.g. Correct – hand sanitizer bottles go in Clear recycling." />
            </div>

            <div className="md:col-span-2 mt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 w-full md:w-auto">
                <Plus size={18} /> Add Item
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b font-bold">Item</th>
                  <th className="p-4 border-b font-bold">Scenario</th>
                  <th className="p-4 border-b font-bold">Bin</th>
                  <th className="p-4 border-b font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const binDef = BINS[item.correctBin];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 border-b">
                        <div className="font-semibold text-gray-800">{item.name}</div>
                        {item.isCommonMistake && <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-medium">Common Mistake</span>}
                      </td>
                      <td className="p-4 border-b text-gray-600">{item.scenario}</td>
                      <td className="p-4 border-b">
                        <select 
                          value={item.correctBin}
                          onChange={(e) => handleChangeBin(item.id, e.target.value as BinType)}
                          className="text-sm font-bold border border-slate-300 px-2 py-1.5 rounded bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full min-w-[120px]"
                        >
                          {Object.values(BINS).map(bin => (
                            <option key={bin.id} value={bin.id}>{bin.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 border-b text-center">
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No items available. Add some using the form above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
