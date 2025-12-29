
import React from 'react';
import { LayoutDashboard, Columns, CheckCircle2, ShieldCheck, LogOut, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  userName: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, userName, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Columns, label: 'Painéis', path: '/painels' },
    { icon: CheckCircle2, label: 'Entregas', path: '/entregas' },
  ];

  if (role === 'admin' || role === 'director') {
    menuItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#E6E8EB] flex flex-col sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0A63FF] rounded-lg flex items-center justify-center text-white font-bold">GA</div>
          <span className="text-xl font-bold tracking-tight text-[#0B1220]">Governança</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                ? 'bg-[#E6F0FF] text-[#0A63FF]' 
                : 'text-[#6B7280] hover:bg-[#F7F7F8] hover:text-[#0B1220]'
              }`}
            >
              <item.icon size={20} />
              {item.label}
              {isActive && <div className="ml-auto w-1 h-4 bg-[#0A63FF] rounded-full" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E6E8EB]">
        <div className="bg-[#F7F7F8] rounded-2xl p-4 flex items-center gap-3">
          <img src={`https://picsum.photos/seed/${userName}/100`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Avatar" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0B1220] truncate">{userName}</p>
            <p className="text-xs text-[#6B7280] capitalize">{role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-[#6B7280] hover:text-[#FF4D4F] transition-colors p-1.5 hover:bg-white rounded-lg shadow-sm"
            title="Sair do sistema"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
