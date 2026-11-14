import { Bell, Search } from 'lucide-react';

export const Topbar = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Buscar no sistema..." 
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-600 transition-colors"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-600 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
            AC
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Admin Clínica</span>
            <span className="text-xs text-slate-400">Unidade Matriz</span>
          </div>
        </div>
      </div>
    </header>
  );
};