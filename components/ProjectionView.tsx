
import React, { useState } from 'react';
import { Transaction } from '../types';
import { THEME } from '../constants';
import { formatCurrency } from '../utils/helpers';
import { Calculator, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export const ProjectionView: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(transactions.map(t => t.id)));

  const realBalance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  const simTransactions = transactions.filter(t => selectedIds.has(t.id));
  const simBalance = simTransactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  const diff = simBalance - realBalance;

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Cálculo para o gráfico de barras
  const maxVal = Math.max(Math.abs(realBalance), Math.abs(simBalance), 1);
  const realHeight = (Math.abs(realBalance) / maxVal) * 100;
  const simHeight = (Math.abs(simBalance) / maxVal) * 100;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
         <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-md border-2 border-slate-100 opacity-60">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Saldo Real Hoje</p>
                 <p className="text-xl font-bold text-slate-600">{formatCurrency(realBalance)}</p>
              </div>
              <div className={`p-6 rounded-[2rem] shadow-lg border-[4px] transform scale-105 ${diff >= 0 ? 'bg-green-50 border-[#A0D8B3] text-green-700' : 'bg-red-50 border-[#FF9AA2] text-red-700'}`}>
                 <p className="text-[10px] font-black opacity-60 uppercase mb-1">Impacto da Escolha</p>
                 <div className="flex items-center gap-2">
                    {diff >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                    <p className="text-2xl font-black">{diff > 0 ? '+' : ''}{formatCurrency(diff)}</p>
                 </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-[6px] border-[#4A7DA5]">
               <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 text-center justify-center">
                 <Calculator className="text-[#67A3D9]" size={20}/> Comparação Visual
               </h3>
               <div className="flex items-end justify-center gap-12 h-40">
                  <div className="flex flex-col items-center gap-2 w-16">
                     <div className="w-full bg-slate-100 rounded-t-xl relative border-x-2 border-t-2 border-slate-200" style={{ height: `${realHeight}%` }}>
                        <div className="absolute inset-0 bg-slate-300/20"></div>
                     </div>
                     <span className="text-[8px] font-black text-slate-400 uppercase">Real</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-16">
                     <div className={`w-full rounded-t-xl relative border-x-4 border-t-4 ${simBalance >= realBalance ? 'bg-[#A0D8B3] border-[#78C2AD]' : 'bg-[#FF9AA2] border-[#E87E85]'}`} style={{ height: `${simHeight}%` }}>
                        <div className="absolute inset-0 bg-white/20"></div>
                     </div>
                     <span className="text-[8px] font-black text-slate-800 uppercase">Simulado</span>
                  </div>
               </div>
               <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl text-center">
                  <p className="text-2xl font-black text-[#67A3D9]">{formatCurrency(simBalance)}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Seu Novo Saldo</p>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[3rem] shadow-xl border-[6px] border-[#4A7DA5] overflow-hidden h-full max-h-[500px] flex flex-col">
            <div className="p-6 bg-[#67A3D9]/10 border-b-4 border-[#4A7DA5]">
               <h3 className="font-black text-slate-700 text-sm">Laboratório Heeler</h3>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Desmarque gastos para ver a "mágica"</p>
            </div>
            <div className="overflow-y-auto flex-1">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                       <th className="px-6 py-4 w-16 text-center">Sim?</th>
                       <th className="px-6 py-4">Item</th>
                       <th className="px-6 py-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {transactions.map(t => (
                       <tr key={t.id} className={`transition-all ${selectedIds.has(t.id) ? 'bg-white' : 'bg-slate-100/50 opacity-40 grayscale'}`}>
                          <td className="px-6 py-4 text-center">
                             <button 
                               onClick={() => toggle(t.id)} 
                               className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.has(t.id) ? 'bg-[#67A3D9] border-[#4A7DA5] text-white' : 'bg-white border-slate-200'}`}
                             >
                               {selectedIds.has(t.id) && <CheckCircle2 size={14}/>}
                             </button>
                          </td>
                          <td className="px-6 py-4 text-xs font-black text-slate-700">{t.description}</td>
                          <td className={`px-6 py-4 text-xs font-black text-right ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};
