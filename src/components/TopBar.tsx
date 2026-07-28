import React, { useState } from 'react';
import { Home, Globe, Menu } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Language, View } from '../types';

interface TopBarProps {
  t: any;
  currentView: View;
  setCurrentView: (view: View) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

/**
 * TopBar acts as the main header, housing navigation items and language selectors.
 */
export const TopBar: React.FC<TopBarProps> = ({ 
  t, 
  currentView, 
  setCurrentView, 
  lang, 
  setLang 
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ComponentType<any>; label: string }) => (
    <button 
      onClick={() => { setCurrentView(view); setMenuOpen(false); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 transform text-sm ${
        currentView === view 
          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-lg shadow-primary-500/30 -translate-y-0.5' 
          : 'text-gray-600 hover:bg-gray-100/80 hover:-translate-y-0.5 hover:shadow-sm hover:text-primary-600'
      }`}
    >
      <Icon size={16} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 shadow-sm z-[100] flex items-center justify-between px-4 md:px-12 no-print transition-all">
      <div className="transform transition-transform hover:scale-105 duration-300 cursor-pointer">
        <BrandLogo onClick={() => setCurrentView('home')} />
      </div>
      
      <nav className="hidden md:flex items-center gap-3">
         <NavItem view="home" icon={Home} label={t.home} />
         <div className="w-[1px] h-5 bg-gray-200/80 mx-1"></div>
         <button 
           onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} 
           className="flex items-center gap-2 text-[11px] font-black bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
         >
           <Globe size={14} /> {lang === 'ar' ? 'English' : 'العربية'}
         </button>
      </nav>
      
      <div className="md:hidden flex items-center gap-3">
         <button 
           onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} 
           className="text-[11px] font-black bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-gray-900 border border-gray-200 shadow-sm transition-transform active:scale-95"
         >
           {lang === 'ar' ? 'EN' : 'AR'}
         </button>
         <button 
           onClick={() => setMenuOpen(!menuOpen)} 
           className="p-2 text-gray-900 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm transition-transform active:scale-95"
         >
           <Menu size={20} />
         </button>
      </div>
      
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl p-5 flex flex-col gap-3 md:hidden animate-fade-in z-50 rounded-b-2xl">
           <NavItem view="home" icon={Home} label={t.home} />
        </div>
      )}
    </header>
  );
};
