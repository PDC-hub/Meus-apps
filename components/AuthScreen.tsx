
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { THEME } from '../constants';
import { DriveService } from '../services/driveService';
import { 
  Dog, 
  LogIn, 
  Loader2, 
  AlertCircle, 
  UserCheck
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (u: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const [showErr400, setShowErr400] = useState(false);
  const [showErr403, setShowErr403] = useState(false);

  useEffect(() => {
    const initGoogle = async () => {
      try {
        await DriveService.loadGapi();
        await DriveService.loadGis(async (tokenResponse) => {
          setGoogleLoading(true);
          if (tokenResponse && tokenResponse.access_token && window.gapi.client) {
             window.gapi.client.setToken(tokenResponse);
          }
          const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });
          const userInfo = await userInfoRes.json();
          onLogin({
            username: userInfo.name || userInfo.email,
            isAuthenticated: true,
            source: 'google',
            avatarUrl: userInfo.picture
          });
        });
      } catch (e) {
        console.error("Google Init Failed", e);
      }
    };
    initGoogle();
  }, [onLogin]);

  const handleGoogleLogin = () => DriveService.requestLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!username || !password) {
      setError('Ei! Preencha tudo primeiro.');
      return;
    }
    const storedUsers = JSON.parse(localStorage.getItem('bluey_users') || '[]');
    if (isRegistering) {
      if (storedUsers.find((u: any) => u.username === username)) {
        setError('Esse nome já está na brincadeira!');
        return;
      }
      localStorage.setItem('bluey_users', JSON.stringify([...storedUsers, { username, pin: password }]));
      setSuccess('Oba! Agora faça o login.');
      setIsRegistering(false);
      setPassword('');
    } else {
      const validUser = storedUsers.find((u: any) => u.username === username && u.pin === password);
      if (validUser) {
        onLogin({ username: validUser.username, isAuthenticated: true, source: 'local', pin: validUser.pin });
      } else {
        setError('Ops! Nome ou PIN errados.');
      }
    }
  };

  return (
    <div className={`min-h-screen ${THEME.bg} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#67A3D9]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#FF9F5A]/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-[0_20px_0_0_rgba(74,125,165,0.2)] overflow-hidden border-[6px] border-[#4A7DA5] relative z-10">
        <div className={`${isRegistering ? THEME.accent : THEME.primary} p-10 text-center transition-colors duration-500 border-b-[6px] border-[#4A7DA5]`}>
          <div className="mx-auto flex items-center justify-center mb-4">
             <div className="relative w-36 h-36 flex items-center justify-center bg-white/30 rounded-full border-4 border-white/50">
                <img 
                   src="https://upload.wikimedia.org/wikipedia/en/c/c5/Bluey_Character_Image.png" 
                   alt="Bluey" 
                   className="h-32 w-auto object-contain drop-shadow-xl transform hover:scale-110 transition-transform cursor-pointer"
                />
             </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
            {isRegistering ? 'Nova Conta' : 'Bluey Finance'}
          </h1>
          <p className="text-white font-bold mt-2 text-lg">Economia para toda a Família</p>
        </div>
        
        <div className="p-8 space-y-6">
          <button 
             onClick={handleGoogleLogin}
             disabled={googleLoading}
             className="w-full bg-white border-[4px] border-[#4A7DA5] hover:bg-blue-50 text-[#4A7DA5] font-black py-4 rounded-2xl shadow-[0_6px_0_0_#4A7DA5] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-3"
          >
             {googleLoading ? <Loader2 className="animate-spin" size={24} /> : <LogIn size={24} />}
             ENTRAR COM GOOGLE
          </button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t-4 border-dashed border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-black uppercase">OU LOCAL</span>
            <div className="flex-grow border-t-4 border-dashed border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {success && <div className="bg-green-100 border-4 border-green-400 text-green-700 p-3 rounded-2xl text-sm font-black text-center">{success}</div>}
            
            <div className="space-y-1">
              <label className="text-xs font-black text-[#4A7DA5] ml-4 uppercase">Seu Nome</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-[4px] border-slate-100 bg-slate-50 focus:border-[#67A3D9] focus:bg-white focus:outline-none text-slate-900 font-bold placeholder-slate-300"
                placeholder="Ex: Bandit"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-[#4A7DA5] ml-4 uppercase">Seu PIN</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-[4px] border-slate-100 bg-slate-50 focus:border-[#67A3D9] focus:bg-white focus:outline-none text-slate-900 font-bold placeholder-slate-300"
                placeholder="****"
              />
            </div>

            {error && <p className="text-red-500 font-black text-sm text-center bg-red-50 py-2 rounded-xl border-2 border-red-100">{error}</p>}
            
            <button type="submit" className={`w-full ${isRegistering ? THEME.accent : THEME.primary} text-white font-black text-xl py-5 rounded-2xl border-b-[8px] border-black/20 shadow-lg hover:brightness-110 active:translate-y-[4px] active:border-b-[4px] transition-all uppercase tracking-wider`}>
              {isRegistering ? 'CADASTRAR' : 'PLANILHAR'}
            </button>

            <div className="text-center pt-2">
              <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-black text-[#4A7DA5] hover:text-[#67A3D9] underline decoration-4 underline-offset-4">
                {isRegistering ? 'Já tenho conta! Login' : 'Não tem conta? Crie uma!'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
