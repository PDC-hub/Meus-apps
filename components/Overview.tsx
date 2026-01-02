
import React from 'react';
import { Transaction } from '../types';
import { CATEGORIES, THEME } from '../constants';
import { PieChart as PieIcon, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export const Overview: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
  const priorityBills = expenses.filter(t => t.isPriority && !t.isPaid);

  const chartData = CATEGORIES.map(cat => {
    const value = expenses.filter(t => t.category === cat).reduce((acc, t) => acc + t.amount, 0);
    return { label: cat, value, color: THEME.charts[cat] };
  }).filter(item => item.value > 0);

  let cumulativePercent = 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <PieIcon className="text-[#89C2F5]" /> Gastos por Categoria
        </h3>
        {totalExpense === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
             <div className="w-24 h-24 rounded-full border-4 border-gray-100 mb-4 flex items-center justify-center"><PieIcon size={32} /></div>
             <p className="font-bold">Sem despesas registradas</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-md">
                {chartData.map((slice, idx) => {
                  const percent = slice.value / totalExpense;
                  const dashArray = percent * 251.2;
                  const dashOffset = -cumulativePercent * 251.2;
                  cumulativePercent += percent;
                  return (
                    <circle key={idx} r="40" cx="50" cy="50" fill="transparent" stroke={slice.color} strokeWidth="16" strokeDasharray={`${dashArray} 251.2`} strokeDashoffset={dashOffset} className="transition-all duration-500" />
                  );
                })}
                <circle r="32" cx="50" cy="50" fill="#FFFDF5" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                <span className="text-xs font-bold text-gray-700">{formatCurrency(totalExpense)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
               {chartData.map((slice, i) => (
                 <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }}></div>
                      <span className="font-bold text-gray-600">{slice.label}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(slice.value)}</span>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="text-orange-400" /> Contas Prioritárias
        </h3>
        {priorityBills.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
             <ShieldCheck className="mx-auto mb-2 text-green-300" size={48} />
             <p className="font-bold">Tudo em dia!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
             {priorityBills.map(bill => (
               <div key={bill.id} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{bill.description}</p>
                    <div className="flex gap-2 text-[10px] text-red-500 font-bold mt-1">
                      {bill.dueDate && <span className="flex items-center gap-1"><Clock size={10} /> {new Date(bill.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <span className="font-bold text-red-600">{formatCurrency(bill.amount)}</span>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
