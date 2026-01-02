
import React, { useState } from 'react';
import { Goal } from '../types';
import { formatCurrency, generateId } from '../utils/helpers';
import { Target, Trash2, Calculator, PiggyBank, Plus, X, Dog } from 'lucide-react';

interface GoalGridProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  balance: number;
}

export const GoalGrid: React.FC<GoalGridProps> = ({ goals, setGoals, balance }) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({ name: '', targetAmount: 0, deadline: new Date().toISOString().split('T')[0] });

  const saveGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    setGoals(prev => [{ ...newGoal, id: generateId() } as Goal, ...prev]);
    setShowGoalModal(false);
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-black text-gray-800 flex items-center gap-2"><Target className="text-orange-400" /> Objetivos da Família</h2>
         <button onClick={() => setShowGoalModal(true)} className="bg-orange-400 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"><Plus size={18}/> Novo Objetivo</button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-20 text-center">
           <Target size={48} className="mx-auto text-gray-100 mb-4" />
           <p className="font-bold text-gray-300">Nenhuma meta definida ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {goals.map(goal => {
              const gap = Math.max(0, goal.targetAmount - balance);
              const progress = Math.min(100, Math.max(0, (balance / goal.targetAmount) * 100));
              const months = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
              
              return (
                <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="bg-orange-50 p-3 rounded-2xl text-orange-400"><Target size={24}/></div>
                      <button onClick={() => setGoals(prev => prev.filter(g => g.id !== goal.id))} className="text-gray-200 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
                   </div>
                   <h3 className="text-xl font-black text-gray-800 mb-1">{goal.name}</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Meta: {formatCurrency(goal.targetAmount)} • {new Date(goal.deadline).toLocaleDateString()}</p>
                   
                   <div className="w-full bg-gray-100 h-4 rounded-full mb-6 overflow-hidden relative">
                      <div className="bg-gradient-to-r from-orange-300 to-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                   </div>

                   <div className="flex justify-between items-end mb-6">
                      <div><p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Saldo</p><p className="font-black text-gray-700">{formatCurrency(balance)}</p></div>
                      <div className="text-right"><p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Falta</p><p className="font-black text-orange-400">{formatCurrency(gap)}</p></div>
                   </div>

                   {gap > 0 ? (
                     <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                        <Calculator size={20} className="text-blue-300"/>
                        <div>
                           <p className="text-[9px] font-bold text-blue-300 uppercase">Economia Sugerida</p>
                           <p className="text-sm font-black text-blue-700">{formatCurrency(gap / months)} /mês <span className="text-[10px] font-medium">por {months} meses</span></p>
                        </div>
                     </div>
                   ) : (
                     <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-4">
                        <PiggyBank size={20} className="text-green-400"/>
                        <p className="text-sm font-black text-green-700">Meta alcançada! Uhul!</p>
                     </div>
                   )}
                </div>
              );
           })}
        </div>
      )}

      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 animate-in zoom-in">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black text-gray-800">Novo Objetivo</h2>
                 <button onClick={() => setShowGoalModal(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20}/></button>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block ml-2">O que é?</label>
                    <input type="text" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-200 outline-none rounded-2xl font-bold" placeholder="Viagem para a Disney" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block ml-2">Valor Alvo (R$)</label>
                    <input type="number" value={newGoal.targetAmount || ''} onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value)})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-200 outline-none rounded-2xl font-bold" placeholder="5000" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block ml-2">Prazo</label>
                    <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-200 outline-none rounded-2xl font-bold" />
                 </div>
                 <button onClick={saveGoal} className="w-full py-4 bg-orange-400 text-white font-bold rounded-2xl shadow-xl hover:bg-orange-500 transition-all active:scale-95">Criar Meta</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
