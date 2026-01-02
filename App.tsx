
import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction, Goal, SyncState, AppData } from './types';
import { DriveService } from './services/driveService';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { THEME } from './constants';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', lastSynced: null });
  const [isLoaded, setIsLoaded] = useState(false);

  const saveData = useCallback(async () => {
    if (!user || !isLoaded) return;
    setSyncState(prev => ({ ...prev, status: 'syncing' }));
    const data: AppData = { 
      transactions, 
      goals, 
      userProfile: { 
        nickname: user.nickname || '',
        avatarId: user.avatarId 
      } 
    };
    
    try {
      if (user.source === 'google') {
        if (!DriveService.fileId) await DriveService.findFile();
        if (DriveService.fileId) await DriveService.updateFile(data);
        else await DriveService.createFile(data);
      } else {
        localStorage.setItem(`bluey_data_${user.username}`, JSON.stringify(data));
      }
      setSyncState({ status: 'saved', lastSynced: new Date() });
    } catch (error) {
      setSyncState(prev => ({ ...prev, status: 'error' }));
    }
  }, [transactions, goals, user, isLoaded]);

  // Persistence logic (auto-save)
  useEffect(() => {
    const timeoutId = setTimeout(saveData, 3000); // Debounced save longer interval for auto-save
    return () => clearTimeout(timeoutId);
  }, [saveData]);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setSyncState({ status: 'syncing', lastSynced: null });
    
    try {
      let loadedData: AppData | null = null;
      if (loggedInUser.source === 'google') {
        const fileId = await DriveService.findFile();
        if (fileId) loadedData = await DriveService.loadFileContent(fileId);
        else loadedData = { transactions: [], goals: [] };
      } else {
        const localData = localStorage.getItem(`bluey_data_${loggedInUser.username}`);
        if (localData) loadedData = JSON.parse(localData);
      }
      
      if (loadedData) {
        setTransactions(loadedData.transactions || []);
        setGoals(loadedData.goals || []);
        if (loadedData.userProfile) {
          setUser(prev => prev ? ({ 
            ...prev, 
            nickname: loadedData.userProfile?.nickname,
            avatarId: loadedData.userProfile?.avatarId
          }) : null);
        }
      }
      setIsLoaded(true);
      setSyncState({ status: 'saved', lastSynced: new Date() });
    } catch (e) {
      console.error("Login Load Error", e);
      setSyncState({ status: 'error', lastSynced: null });
      setIsLoaded(true);
    }
  };

  const handleLogout = () => {
    if (user?.source === 'google') {
       const token = window.gapi?.client?.getToken();
       if (token && window.google?.accounts?.oauth2) {
         window.google.accounts.oauth2.revoke(token.access_token, () => {});
         window.gapi.client.setToken(null);
       }
    }
    setUser(null); setTransactions([]); setGoals([]); setIsLoaded(false); DriveService.fileId = null;
  };

  const updateNickname = (name: string) => {
    setUser(prev => prev ? { ...prev, nickname: name } : null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedFields };
      
      // Se o PIN for local, persistir nos usuários registrados
      if (prev.source === 'local' && updatedFields.pin) {
        const storedUsers = JSON.parse(localStorage.getItem('bluey_users') || '[]');
        const updatedUsers = storedUsers.map((u: any) => 
            u.username === prev.username ? { ...u, pin: updatedFields.pin } : u
        );
        localStorage.setItem('bluey_users', JSON.stringify(updatedUsers));
      }
      
      return newUser;
    });
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  if (!isLoaded && user.source === 'google') {
    return (
      <div className={`min-h-screen ${THEME.bg} flex flex-col items-center justify-center gap-4`}>
        <Loader2 className="animate-spin text-[#89C2F5]" size={48} />
        <p className="text-gray-500 font-bold">Buscando dados da família Heeler...</p>
      </div>
    );
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout} 
      transactions={transactions} 
      setTransactions={setTransactions} 
      goals={goals} 
      setGoals={setGoals} 
      syncState={syncState}
      onUpdateNickname={updateNickname}
      onManualSave={saveData}
      onUpdateUser={updateUser}
    />
  );
};

export default App;
