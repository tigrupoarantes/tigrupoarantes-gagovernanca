
import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Profile, Notification } from '../types';
import { Search } from 'lucide-react';
import { Button } from './ui/Button';
import { NotificationCenter } from './NotificationCenter';
import { DateRangePicker, DateRange } from './ui/DateRangePicker';
import { testConnection } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  user: Profile;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  notifications, 
  onMarkRead, 
  onClearAll,
  dateRange,
  onDateRangeChange,
  onLogout
}) => {
  const [dbStatus, setDbStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    const run = async () => {
      const result = await testConnection();
      setDbStatus(result.success ? 'online' : 'offline');
    };
    run();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar role={user.role} userName={user.full_name} onLogout={onLogout} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-[#E6E8EB] flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[#F7F7F8] px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-[#0A63FF] transition-all group shadow-sm focus-within:shadow-md">
              <Search size={18} className="text-[#6B7280] group-focus-within:text-[#0A63FF]" />
              <input 
                type="text" 
                placeholder="Buscar rotinas estratégicas..." 
                className="bg-transparent border-none text-sm font-medium focus:outline-none w-72 placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F7F8] rounded-2xl border border-[#E6E8EB]">
              <span className={`h-2 w-2 rounded-full ${dbStatus === 'online' ? 'bg-green-500' : dbStatus === 'offline' ? 'bg-red-500' : 'bg-gray-400'}`} />
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                {dbStatus === 'online' ? 'Supabase Online' : dbStatus === 'offline' ? 'Supabase Offline' : 'Supabase...'}
              </span>
            </div>

            <DateRangePicker 
              currentRange={dateRange} 
              onChange={onDateRangeChange} 
            />
            
            <div className="flex items-center gap-4">
              <NotificationCenter 
                notifications={notifications} 
                onMarkRead={onMarkRead} 
                onClearAll={onClearAll} 
              />
              <div className="h-8 w-px bg-[#E6E8EB]" />
              <Button size="sm" variant="secondary" className="font-bold uppercase tracking-wider text-[11px] h-10 px-6 rounded-xl">Filtros Avançados</Button>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
