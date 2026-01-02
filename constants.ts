
import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Salário', 
  'Objetivos', 
  'Despesas', 
  'Custos de vida', 
  'Investimentos', 
  'Entretenimento',
  'Extras'
];

export const AVATARS = [
  { id: 'dad', name: 'Papai (Bandit)', url: 'https://upload.wikimedia.org/wikipedia/en/2/2f/Bandit_Heeler.png' },
  { id: 'mom', name: 'Mamãe (Chilli)', url: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Chilli_Heeler.png' },
  { id: 'sister_old', name: 'Irmã Mais Velha (Bluey)', url: 'https://upload.wikimedia.org/wikipedia/en/c/c5/Bluey_Character_Image.png' },
  { id: 'sister_young', name: 'Irmã Mais Nova (Bingo)', url: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Bingo_Heeler.png' },
  { id: 'brother_old', name: 'Irmão Mais Velho (Rusty)', url: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Rusty_Heeler.png' },
  { id: 'brother_young', name: 'Irmão Mais Novo (Socks)', url: 'https://upload.wikimedia.org/wikipedia/en/d/de/Socks_Heeler.png' },
];

export const THEME = {
  bg: 'bg-[#FFF9E5]', // Creme mais quente
  primary: 'bg-[#67A3D9]', // Azul Bluey mais vivo
  primaryDark: 'bg-[#4A7DA5]', 
  accent: 'bg-[#FF9F5A]', // Laranja Bingo mais vivo
  accentDark: 'bg-[#E07A3D]', 
  card: 'bg-white',
  text: 'text-[#2D3748]',
  border: 'border-[#4A7DA5]', // Cor para bordas de cartoon
  charts: {
    'Salário': '#67A3D9',      
    'Objetivos': '#FF9F5A',    
    'Despesas': '#FF6B6B',     
    'Custos de vida': '#78C2AD', 
    'Investimentos': '#A29BFE', 
    'Entretenimento': '#FDCB6E', 
    'Extras': '#55E6C1'        
  }
} as const;

export const DEFAULT_GOOGLE_CONFIG = {
  clientId: '1039987341180-a3pc0l6qj9r25fb2b7vrivic5fl4esr5.apps.googleusercontent.com',
  apiKey: 'AIzaSyALBX0DSYLZT_l9abKnPojwvya3EKe9sdE',
  scopes: 'https://www.googleapis.com/auth/drive.file'
};
