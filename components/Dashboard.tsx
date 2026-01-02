
import React, { useState } from 'react';
import { User, Transaction, Goal, SyncState, Category } from '../types';
import { THEME, AVATARS } from '../constants';
import { formatCurrency, generateId } from '../utils/helpers';
import { Overview } from './Overview';
import { ProjectionView } from './ProjectionView';
import { TransactionForm } from './TransactionForm';
import { GoalGrid } from './GoalGrid';
import { DriveService } from '../services/driveService';
import { 
  Dog, LogOut, RefreshCw, Cloud, ShieldCheck, 
  TrendingUp, LayoutDashboard, FileText, Target, Calculator, Plus, Trash2, Edit2, CheckCircle2, CloudUpload, Save, Settings, X, Key, UserCircle
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  syncState: SyncState;
  onUpdateNickname: (name: string) => void;
  onManualSave: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, onLogout, transactions, setTransactions, goals, setGoals, syncState, onUpdateNickname, onManualSave, onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'goals' | 'projection'>('overview');
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [showNicknameModal, setShowNicknameModal] = useState(!user.nickname);
  const [tempNickname, setTempNickname] = useState('');

  // Estados locais para configurações
  const [settingsNickname, setSettingsNickname] = useState(user.nickname || '');
  const [settingsPin, setSettingsPin] = useState(user.pin || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(user.avatarId || '');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza? Isso vai sumir como um balão! 🎈')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const togglePaid = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, isPaid: !t.isPaid } : t));
  };

  const handleCloudMigration = () => {
    if (confirm('Quer salvar seus dados na Nuvem Mágica do Google?')) {
      DriveService.requestLogin();
    }
  };

  const handleSaveSettings = () => {
    const avatar = AVATARS.find(a => a.id === selectedAvatarId);
    onUpdateUser({
      nickname: settingsNickname,
      pin: settingsPin,
      avatarId: selectedAvatarId,
      avatarUrl: avatar?.url || user.avatarUrl
    });
    setShowSettings(false);
  };

  return (
    <div className={`min-h-screen pb-24`}>
      {/* Header Fixo/Redesenhado */}
      <header className={`${THEME.primary} bg-clouds text-white px-6 pt-10 pb-12 rounded-b-[3rem] border-b-[6px] border-[#4A7DA5] shadow-2xl relative`}>
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white p-1 rounded-2xl border-4 border-[#4A7DA5] shadow-md relative overflow-hidden group">
                 <img src={user.avatarUrl || 'https://upload.wikimedia.org/wikipedia/en/c/c5/Bluey_Character_Image.png'} className="w-14 h-14 rounded-xl object-contain" alt="User" />
                 <button onClick={() => setShowSettings(true)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Settings size={16} className="text-white" />
                 </button>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black">Olá, {user.nickname || user.username}!</h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 font-black text-[10px] bg-black/10 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-tighter">
                    {user.source === 'google' ? (
                        <><Cloud size={12} /><span>Sincronizado</span></>
                    ) : (
                        <button onClick={handleCloudMigration} className="flex items-center gap-1 hover:text-orange-200"><CloudUpload size={12} /><span>Backup Nuvem</span></button>
                    )}
                    </div>
                    <button onClick={onManualSave} className={`flex items-center gap-1.5 font-black text-[10px] px-3 py-0.5 rounded-full border transition-all ${syncState.status === 'syncing' ? 'bg-white text-[#67A3D9] border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#67A3D9]'}`}>
                        {syncState.status === 'syncing' ? <RefreshCw size={10} className="animate-spin" /> : <Save size={10} />}
                        SALVAR AGORA
                    </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowSettings(true)} className="glass-panel p-3 rounded-2xl hover:bg-white/40 transition-all shadow-lg border-white/50"><Settings size={22} /></button>
                <button onClick={onLogout} className="glass-panel p-3 rounded-2xl hover:bg-white/40 transition-all shadow-lg border-white/50"><LogOut size={22} /></button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-white text-slate-800 p-5 rounded-[2rem] border-[4px] border-[#4A7DA5] shadow-lg transform hover:scale-[1.02] transition-transform">
                <p className="text-[10px] font-black text-[#4A7DA5] uppercase mb-1">Saldo da Família</p>
                <p className="text-2xl md:text-3xl font-black">{formatCurrency(balance)}</p>
             </div>
             <div className="glass-panel p-5 rounded-[2rem] border-2 border-green-200/50 shadow-lg">
                <div className="flex items-center gap-2 text-green-100 text-[10px] font-black uppercase"><TrendingUp size={14} /> Entradas</div>
                <p className="text-xl font-black mt-1 text-white">{formatCurrency(totalIncome)}</p>
             </div>
             <div className="glass-panel p-5 rounded-[2rem] border-2 border-red-200/50 shadow-lg">
                <div className="flex items-center gap-2 text-red-100 text-[10px] font-black uppercase"><TrendingUp size={14} className="rotate-180" /> Saídas</div>
                <p className="text-xl font-black mt-1 text-white">{formatCurrency(totalExpense)}</p>
             </div>
          </div>
        </div>
      </header>

      {/* Navegação e Conteúdo */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
           <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-[2rem] border-[3px] border-[#4A7DA5] shadow-lg overflow-x-auto w-full md:w-auto">
              {[
                {id: 'overview', icon: LayoutDashboard, label: 'Resumo', color: '#67A3D9'},
                {id: 'transactions', icon: FileText, label: 'Lista', color: '#67A3D9'},
                {id: 'goals', icon: Target, label: 'Metas', color: '#FF9F5A'},
                {id: 'projection', icon: Calculator, label: 'Simular', color: '#67A3D9'}
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-white shadow-md' : 'text-slate-500 hover:bg-white/40'}`}
                  style={{ backgroundColor: activeTab === tab.id ? tab.color : 'transparent' }}
                >
                  <tab.icon size={14}/> {tab.label.toUpperCase()}
                </button>
              ))}
           </div>
           <button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} className="w-full md:w-auto bg-[#FF9F5A] text-white px-8 py-4 rounded-3xl font-black text-sm border-b-[6px] border-orange-700 shadow-xl flex items-center justify-center gap-3 active:translate-y-[2px] transition-all">
             <Plus size={20}/> ADICIONAR REGISTRO
           </button>
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'overview' && <Overview transactions={transactions} />}
          {activeTab === 'projection' && <ProjectionView transactions={transactions} />}
          {activeTab === 'goals' && <GoalGrid goals={goals} setGoals={setGoals} balance={balance} />}
          
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl border-[6px] border-[#4A7DA5] overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                     <thead className="bg-[#67A3D9]/10 border-b-[4px] border-[#4A7DA5] text-[10px] font-black uppercase text-[#4A7DA5] tracking-widest">
                        <tr>
                          <th className="px-6 py-4 text-center">OK?</th>
                          <th className="px-6 py-4">Data</th>
                          <th className="px-6 py-4">O que foi?</th>
                          <th className="px-6 py-4">Categoria</th>
                          <th className="px-6 py-4 text-right">Valor</th>
                          <th className="px-6 py-4 text-center">Mexer</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-slate-100">
                        {transactions.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-20 text-slate-300 font-bold">Nenhum registro ainda. Clique em "ADICIONAR"!</td></tr>
                        ) : transactions.map(t => (
                          <tr key={t.id} className={`hover:bg-blue-50/30 transition-colors ${t.isPaid ? 'opacity-40 grayscale' : ''}`}>
                            <td className="px-6 py-4 text-center">
                              {t.type === 'expense' && (
                                <button onClick={() => togglePaid(t.id)} className={`p-1.5 rounded-lg border-2 transition-all ${t.isPaid ? 'bg-green-500 border-green-700 text-white' : 'bg-white border-slate-200 text-slate-200'}`}>
                                  <CheckCircle2 size={18}/>
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 text-[10px] font-black text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-black text-slate-700 text-sm">
                              {t.description}
                              {t.isPriority && <span className="ml-2 inline-block text-[8px] bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full uppercase border border-orange-200">Urgente</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[9px] font-black px-2 py-1 rounded-lg border" style={{ backgroundColor: `${THEME.charts[t.category]}15`, borderColor: THEME.charts[t.category], color: THEME.charts[t.category] }}>{t.category.toUpperCase()}</span>
                            </td>
                            <td className={`px-6 py-4 text-sm font-black text-right ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                 <button onClick={() => { setEditingTransaction(t); setShowForm(true); }} className="text-slate-300 hover:text-[#67A3D9] p-1.5 transition-all"><Edit2 size={16}/></button>
                                 <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-red-500 p-1.5 transition-all"><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] p-10 max-w-sm w-full text-center border-[8px] border-[#67A3D9] shadow-2xl animate-in zoom-in">
              <div className="w-20 h-20 bg-[#67A3D9] rounded-3xl border-4 border-white shadow-lg mx-auto mb-6 flex items-center justify-center text-white"><Dog size={40}/></div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Qual seu nome Heeler?</h2>
              <p className="text-slate-500 text-xs mb-6 font-bold uppercase tracking-widest">Queremos te dar as boas vindas!</p>
              <input type="text" value={tempNickname} onChange={(e) => setTempNickname(e.target.value)} className="w-full text-center text-xl font-black p-4 rounded-2xl border-[4px] border-slate-100 focus:border-[#67A3D9] outline-none mb-6 text-slate-800" placeholder="Ex: Bluey" />
              <button onClick={() => { if(tempNickname.trim()){ onUpdateNickname(tempNickname); setShowNicknameModal(false); } }} className="w-full py-4 bg-[#67A3D9] text-white font-black rounded-2xl border-b-[6px] border-blue-800 shadow-lg hover:brightness-110 active:translate-y-[2px] transition-all uppercase tracking-widest">Vamos gerir nosso orçamento</button>
           </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto">
           <div className="bg-white rounded-[3rem] p-8 max-w-lg w-full border-[8px] border-[#67A3D9] shadow-2xl animate-in zoom-in my-auto">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Settings className="text-[#67A3D9]" /> Configurações</h2>
                 <button onClick={() => setShowSettings(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block">Seu Apelido</label>
                    <div className="relative">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input type="text" value={settingsNickname} onChange={(e) => setSettingsNickname(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border-4 border-slate-100 focus:border-[#67A3D9] outline-none font-black text-slate-800" />
                    </div>
                 </div>

                 {user.source === 'local' && (
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block">Trocar PIN</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input type="password" value={settingsPin} onChange={(e) => setSettingsPin(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border-4 border-slate-100 focus:border-[#67A3D9] outline-none font-black text-slate-800" placeholder="****" />
                        </div>
                    </div>
                 )}

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block">Escolha sua Personagem</label>
                    <div className="grid grid-cols-3 gap-3">
                        {AVATARS.map(av => (
                            <button 
                                key={av.id} 
                                onClick={() => setSelectedAvatarId(av.id)}
                                className={`p-2 rounded-2xl border-4 transition-all flex flex-col items-center gap-1 ${selectedAvatarId === av.id ? 'border-[#67A3D9] bg-blue-50' : 'border-slate-50 hover:border-slate-100'}`}
                            >
                                <img src={av.url} className="w-12 h-12 object-contain" alt={av.name} />
                                <span className="text-[8px] font-black text-center text-slate-500 leading-tight">{av.name}</span>
                            </button>
                        ))}
                    </div>
                 </div>

                 <button onClick={handleSaveSettings} className="w-full py-4 bg-[#67A3D9] text-white font-black rounded-2xl border-b-[6px] border-blue-800 shadow-lg hover:brightness-110 active:translate-y-[2px] transition-all uppercase tracking-widest mt-4">SALVAR ALTERAÇÕES</button>
              </div>
           </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <TransactionForm 
          onClose={() => setShowForm(false)} 
          onSave={(newTransactions) => {
            if (editingTransaction) {
              setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? newTransactions[0] : t));
            } else {
              setTransactions(prev => [...newTransactions, ...prev]);
            }
            setShowForm(false);
          }}
          initialData={editingTransaction}
        />
      )}
    </div>
  );
};
