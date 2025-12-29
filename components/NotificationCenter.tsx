
import React, { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkRead, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[#6B7280] hover:bg-[#F7F7F8] rounded-xl relative transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF4D4F] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#E6E8EB] shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-[#E6E8EB] flex items-center justify-between bg-[#F7F7F8]">
                <h3 className="font-bold text-sm text-[#0B1220]">Notificações</h3>
                <button 
                  onClick={onClearAll}
                  className="text-[11px] font-bold text-[#0A63FF] hover:underline uppercase tracking-wider"
                >
                  Limpar tudo
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-[#E6E8EB]">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 hover:bg-[#F7F7F8] transition-all cursor-pointer group ${!n.read ? 'bg-[#E6F0FF]/30' : ''}`}
                        onClick={() => onMarkRead(n.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            n.type === 'danger' ? 'bg-[#FF4D4F]' : 
                            n.type === 'warning' ? 'bg-[#FFB020]' : 
                            n.type === 'success' ? 'bg-[#00B37E]' : 'bg-[#0A63FF]'
                          }`} />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-[#0B1220] mb-0.5">{n.title}</p>
                            <p className="text-xs text-[#6B7280] leading-relaxed mb-1">{n.message}</p>
                            <p className="text-[10px] text-[#9CA3AF]">
                              {format(new Date(n.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Check className="mx-auto text-[#00B37E] mb-2 opacity-50" size={32} />
                    <p className="text-xs text-[#6B7280]">Você está em dia!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};