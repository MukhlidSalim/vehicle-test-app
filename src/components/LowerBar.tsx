import React from 'react';

/**
 * LowerBar represents the application footer, holding developer credentials and contact links.
 */
export const LowerBar: React.FC = () => (
  <footer className="w-full bg-gradient-to-br from-primary-900 to-primary-800 py-4 mt-auto no-print border-t border-white/10 relative overflow-hidden shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.3)]">
     <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-white/5 to-transparent skew-x-[-15deg] translate-x-20"></div>
     
     <div className="relative z-10 flex flex-col items-center justify-center p-2 text-center text-[10px] text-white font-black tracking-widest space-y-1 uppercase">
        <div className="flex items-center gap-4">
          <div className="w-10 h-[1px] bg-white/20"></div>
          <span className="opacity-90">Engineering by Mukhlid AL Rawahi</span>
          <div className="w-10 h-[1px] bg-white/20"></div>
        </div>
        <a 
          href="mailto:Maklad.alrawahi@bp.com" 
          className="text-primary-400 hover:text-white hover:underline transition-all duration-300 transform hover:scale-105"
        >
          Maklad.alrawahi@bp.com
        </a>
        <div className="text-[9px] opacity-60 font-bold tracking-[0.2em] mt-0.5">2026</div>
     </div>
  </footer>
);
