
import React, { useState, useMemo } from 'react';
import { Transaction, Category, InstallmentTypeMode, InstallmentPeriod } from '../types';
import { CATEGORIES, THEME } from '../constants';
import { generateId, getNextInstallmentDate, formatCurrency } from '../utils/helpers';
import { X, Check, Calculator, Dog, Tag, Lock, Unlock } from 'lucide-react';

interface TransactionFormProps {
  onClose: () => void;
  onSave: (transactions: Transaction[]) => void;
  initialData?: Transaction;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>(initialData || {
    type: 'expense',
    category: 'Despesas',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    installments: '1',
    isPaid: false
  });

  const [installmentTypeMode, setInstallmentTypeMode] = useState<InstallmentTypeMode>(initialData?.installmentType || 'none');
  const [hasDiscount, setHasDiscount] = useState((initialData?.discountAmount || 0) > 0);
  const [discountAmount, setDiscountAmount] = useState(initialData?.discountAmount || 0);
  const [userSuppliedRate, setUserSuppliedRate] = useState(initialData?.interestRate?.replace('%', '') || '');
  const [installmentPeriod, setInstallmentPeriod] = useState<InstallmentPeriod>(initialData?.installmentPeriod || 'month');

  // Novo estado para valor de parcela manual
  const [isManualInstallment, setIsManualInstallment] = useState(false);
  const [manualInstallmentValue, setManualInstallmentValue] = useState(0);

  const calculatedValues = useMemo(() => {
    const amount = formData.amount || 0;
    const installments = Math.max(1, parseInt(formData.installments || '1') || 1);
    
    // O desconto é abatido do valor total base
    const amountAfterDiscount = Math.max(0, amount - discountAmount);
    
    // Se o usuário fixou o valor da parcela manualmente
    if (isManualInstallment && manualInstallmentValue > 0) {
      const totalGenerated = manualInstallmentValue * installments;
      const diff = totalGenerated - amountAfterDiscount;
      // Cálculo de juros simples mensal pela diferença
      const totalInterestPercent = amountAfterDiscount > 0 ? (diff / amountAfterDiscount) * 100 : 0;
      const monthlyRate = installments > 0 ? totalInterestPercent / installments : 0;

      return { 
        total: totalGenerated, 
        parcel: manualInstallmentValue, 
        rate: monthlyRate > 0 ? `${monthlyRate.toFixed(2)}% /mês` : '', 
        discount: discountAmount 
      };
    }

    if (installmentTypeMode === 'interest') {
      const rate = parseFloat(userSuppliedRate) || 0;
      const total = amountAfterDiscount * (1 + rate / 100);
      return { total, parcel: total / installments, rate: `${rate}%`, discount: discountAmount };
    }
    
    // No modo padrão ("none" ou "discount" unificado)
    return { total: amountAfterDiscount, parcel: amountAfterDiscount / installments, rate: '', discount: discountAmount };
  }, [formData.amount, formData.installments, installmentTypeMode, discountAmount, userSuppliedRate, isManualInstallment, manualInstallmentValue]);

  const handleSubmit = () => {
    if (!formData.description || !formData.amount || formData.amount <= 0) return;
    const count = Math.max(1, parseInt(formData.installments || '1') || 1);
    const results: Transaction[] = [];
    const baseId = initialData?.id || generateId();

    const main: Transaction = {
      ...formData as any,
      id: baseId,
      amount: calculatedValues.total,
      installmentValue: calculatedValues.parcel,
      interestRate: calculatedValues.rate,
      discountAmount: calculatedValues.discount,
      installmentType: isManualInstallment ? 'interest' : installmentTypeMode,
      installmentPeriod,
      futureTransactionIds: count > 1 ? [] : undefined
    };

    results.push(main);
    if (count > 1 && !initialData) {
      for (let i = 1; i < count; i++) {
        const futureId = generateId();
        results.push({
          ...main,
          id: futureId,
          date: getNextInstallmentDate(main.date, i, installmentPeriod),
          description: `${main.description} (${i + 1}/${count})`,
          amount: calculatedValues.parcel,
          installments: undefined,
          installmentValue: undefined,
          futureTransactionIds: undefined,
          isPaid: false
        });
        main.futureTransactionIds?.push(futureId);
      }
    }
    onSave(results);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-lg z-[200] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] w-full max-w-xl shadow-2xl p-6 sm:p-10 relative border-[6px] sm:border-[8px] border-[#67A3D9] my-auto animate-in zoom-in slide-in-from-bottom-10">
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 sm:p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 border-2 border-transparent hover:border-slate-200 transition-all"><X size={20}/></button>
        <h2 className="text-xl sm:text-3xl font-black text-slate-800 mb-6 sm:mb-10 flex items-center gap-3 sm:gap-4"><Dog className="text-[#67A3D9] w-8 h-8 sm:w-10 sm:h-10" /> {initialData ? 'Editar' : 'Novo'} Registro</h2>

        <div className="space-y-4 sm:space-y-8 max-h-[70vh] overflow-y-auto px-1">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-slate-200">
            <button onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs font-black transition-all ${formData.type === 'income' ? 'bg-[#A0D8B3] text-green-900 border-b-4 border-green-700 shadow-md' : 'text-slate-400'}`}>ENTRADA</button>
            <button onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs font-black transition-all ${formData.type === 'expense' ? 'bg-[#FF9AA2] text-red-900 border-b-4 border-red-700 shadow-md' : 'text-slate-400'}`}>SAÍDA</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-[#67A3D9] uppercase ml-4">Valor à Vista (R$)</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#67A3D9] font-black">R$</span>
                   <input type="number" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-2xl border-[3px] border-slate-100 focus:border-[#67A3D9] focus:bg-white outline-none font-black text-slate-800" placeholder="0,00" />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-[#67A3D9] uppercase ml-4">Data</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 sm:py-4 rounded-2xl border-[3px] border-slate-100 focus:border-[#67A3D9] focus:bg-white outline-none font-black text-slate-800" />
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black text-[#67A3D9] uppercase ml-4">O que foi feito?</label>
             <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-3 sm:py-4 rounded-2xl border-[3px] border-slate-100 focus:border-[#67A3D9] focus:bg-white outline-none font-black text-slate-800" placeholder="Ex: Mercado semanal" />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-[#67A3D9] uppercase ml-4 text-center block">Categoria</label>
             <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFormData({...formData, category: c})} className={`px-3 py-2 rounded-xl text-[8px] font-black border-2 transition-all uppercase tracking-wider ${formData.category === c ? 'text-white shadow-lg scale-105' : 'bg-white border-slate-50 text-slate-400'}`} style={{ backgroundColor: formData.category === c ? THEME.charts[c] : '' }}>{c}</button>
                ))}
             </div>
          </div>

          <div className="p-4 sm:p-6 bg-blue-50/50 rounded-[2rem] border-[3px] border-[#67A3D9] border-dashed space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#4A7DA5] flex items-center gap-2 uppercase tracking-widest"><Calculator size={14}/> Detalhes Extras</span>
                <button onClick={() => setFormData({...formData, isPriority: !formData.isPriority})} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[8px] font-black uppercase ${formData.isPriority ? 'bg-[#FF9F5A] border-orange-600 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                   <span>Urgente</span>
                </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select disabled={isManualInstallment} value={installmentTypeMode === 'discount' ? 'none' : installmentTypeMode} onChange={(e) => setInstallmentTypeMode(e.target.value as any)} className="bg-white px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#67A3D9] outline-none text-[9px] font-black text-slate-600 uppercase disabled:opacity-50">
                   <option value="none">À vista / Sem Juros</option>
                   <option value="interest">Teve Juros (Eita!)</option>
                </select>
                <div className="relative">
                   <input type="number" min="1" value={formData.installments || '1'} onChange={(e) => setFormData({...formData, installments: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#67A3D9] outline-none text-[9px] font-black text-slate-600 uppercase" placeholder="1" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300">VEZES</span>
                </div>
             </div>

             <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => { setHasDiscount(!hasDiscount); if(!hasDiscount) setDiscountAmount(0); }} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-[9px] font-black uppercase ${hasDiscount ? 'bg-[#FF9F5A] border-orange-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  <Tag size={12}/> {hasDiscount ? 'COM DESCONTO' : 'TEVE DESCONTO?'}
                </button>

                <button 
                  onClick={() => setIsManualInstallment(!isManualInstallment)} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-[9px] font-black uppercase ${isManualInstallment ? 'bg-[#67A3D9] border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  {isManualInstallment ? <Lock size={12}/> : <Unlock size={12}/>} {isManualInstallment ? 'PARCELA FIXA' : 'FIXAR PARCELA?'}
                </button>
             </div>

             {hasDiscount && (
               <div className="animate-in slide-in-from-top-2">
                  <label className="text-[9px] font-black text-[#67A3D9] uppercase ml-4 mb-1 block">Valor do Desconto (R$)</label>
                  <input 
                    type="number" 
                    value={discountAmount || ''} 
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)} 
                    className="w-full bg-white px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#67A3D9] outline-none text-xs font-black text-slate-800" 
                    placeholder="0,00" 
                  />
               </div>
             )}

             {isManualInstallment && (
               <div className="animate-in slide-in-from-top-2">
                  <label className="text-[9px] font-black text-[#67A3D9] uppercase ml-4 mb-1 block">Valor fixo por parcela (R$)</label>
                  <input 
                    type="number" 
                    value={manualInstallmentValue || ''} 
                    onChange={(e) => setManualInstallmentValue(parseFloat(e.target.value) || 0)} 
                    className="w-full bg-white px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#67A3D9] outline-none text-xs font-black text-slate-800" 
                    placeholder="0,00" 
                  />
                  {calculatedValues.rate && (
                    <p className="mt-1 ml-4 text-[9px] font-bold text-orange-500 uppercase tracking-tighter">Juros detectado: {calculatedValues.rate}</p>
                  )}
               </div>
             )}

             {!isManualInstallment && installmentTypeMode === 'interest' && (
                <div className="animate-in slide-in-from-top-2">
                   <label className="text-[9px] font-black text-[#67A3D9] uppercase ml-4 mb-1 block">Qual a taxa de juros? (%)</label>
                   <input 
                      type="number" 
                      value={userSuppliedRate} 
                      onChange={(e) => setUserSuppliedRate(e.target.value)} 
                      className="w-full bg-white px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#67A3D9] outline-none text-xs font-black text-slate-800" 
                      placeholder="0"
                   />
                </div>
             )}

             <div className="pt-4 border-t-2 border-dashed border-[#67A3D9]/20 flex justify-between items-center font-black">
                <div className="text-center">
                   <p className="text-[8px] text-[#4A7DA5] uppercase">Total Gerado</p>
                   <p className="text-lg text-slate-800">{formatCurrency(calculatedValues.total)}</p>
                </div>
                <div className="text-center">
                   <p className="text-[8px] text-[#4A7DA5] uppercase">Por Parcela</p>
                   <p className="text-lg text-[#67A3D9]">{formatCurrency(calculatedValues.parcel)}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
           <button onClick={onClose} className="w-full sm:flex-1 py-4 bg-slate-50 text-slate-400 font-black rounded-2xl border-b-4 border-slate-200 uppercase tracking-widest">FECHAR</button>
           <button onClick={handleSubmit} className="w-full sm:flex-[2] py-4 bg-[#67A3D9] text-white font-black rounded-2xl border-b-[6px] border-blue-800 shadow-xl active:translate-y-[2px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
             <Check size={20}/> SALVAR AGORA
           </button>
        </div>
      </div>
    </div>
  );
};
