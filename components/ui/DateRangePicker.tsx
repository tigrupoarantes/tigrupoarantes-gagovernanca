
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subDays, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear,
  isSameDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface DateRangePickerProps {
  currentRange: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ currentRange, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shortcuts = [
    { 
      label: 'Este Mês', 
      getRange: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()), label: 'Este Mês' }) 
    },
    { 
      label: 'Últimos 30 Dias', 
      getRange: () => ({ start: subDays(new Date(), 30), end: new Date(), label: 'Últimos 30 Dias' }) 
    },
    { 
      label: 'Este Trimestre', 
      getRange: () => ({ start: startOfQuarter(new Date()), end: endOfQuarter(new Date()), label: 'Este Trimestre' }) 
    },
    { 
      label: 'Este Ano', 
      getRange: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()), label: 'Este Ano' }) 
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectShortcut = (shortcut: typeof shortcuts[0]) => {
    onChange(shortcut.getRange());
    setIsOpen(false);
  };

  const displayRange = `${format(currentRange.start, "dd MMM", { locale: ptBR })} - ${format(currentRange.end, "dd MMM", { locale: ptBR })}`;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-[#F7F7F8] hover:bg-white hover:shadow-md border border-[#E6E8EB] px-4 py-2 rounded-xl transition-all group"
      >
        <Calendar size={16} className="text-[#0A63FF]" />
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase text-[#9CA3AF] leading-none mb-0.5 group-hover:text-[#0A63FF] transition-colors">Período de Análise</p>
          <p className="text-sm font-bold text-[#0B1220]">{currentRange.label === 'Custom' ? displayRange : currentRange.label}</p>
        </div>
        <ChevronDown size={14} className={`text-[#6B7280] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E6E8EB] shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-[#E6E8EB] bg-[#F7F7F8]">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Atalhos Inteligentes</p>
            </div>
            <div className="p-2">
              {shortcuts.map((shortcut) => {
                const isActive = currentRange.label === shortcut.label;
                return (
                  <button
                    key={shortcut.label}
                    onClick={() => handleSelectShortcut(shortcut)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-[#E6F0FF] text-[#0A63FF]' 
                        : 'text-[#6B7280] hover:bg-[#F7F7F8] hover:text-[#0B1220]'
                    }`}
                  >
                    {shortcut.label}
                    {isActive && <Check size={14} />}
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-[#E6E8EB] bg-[#F7F7F8]/50">
              <p className="text-[10px] text-[#9CA3AF] italic text-center">
                Refletindo dados de {format(currentRange.start, "dd/MM")} até {format(currentRange.end, "dd/MM/yy")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
