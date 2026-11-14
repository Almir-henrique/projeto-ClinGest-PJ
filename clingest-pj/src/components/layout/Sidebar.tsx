import React from 'react';
import { Users, CheckSquare, ShieldCheck, DollarSign, LayoutDashboard, LogOut } from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Analítico', icon: LayoutDashboard },
    { id: 'prestadores', label: 'Prestadores PJ', icon: Users },
    { id: 'tarefas', label: 'Gestão de Entregas', icon: CheckSquare },
    { id: 'compliance', label: 'Compliance e Docs', icon: ShieldCheck },
    { id: 'faturamento', label: 'Faturamento e Repasses', icon: DollarSign },
  ];

  return (
    <aside className="w-64 bg-brand-navy text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-white text-base">ClinGest PJ</h1>
          <p className="text-xs text-brand-teal font-medium">Painel Administrativo</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};