
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, Paperclip, Link as LinkIcon, StickyNote, MessageSquare, Trash2, Send, History, ShieldCheck, UserCheck } from 'lucide-react';
import { GovernanceCycle, CycleStatus, GovernanceEvidence, GovernanceComment, HistoryEntry } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { format, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendChart } from './TrendChart';
import { RiskIndicator } from './RiskIndicator';

interface CycleDrawerProps {
  cycle: GovernanceCycle | null;
  onClose: () => void;
  onUpdateStatus: (cycleId: string, status: CycleStatus) => void;
  evidences: GovernanceEvidence[];
  comments: GovernanceComment[];
  history: HistoryEntry[];
  onAddEvidence: (data: Partial<GovernanceEvidence>) => void;
  onDeleteEvidence: (id: string) => void;
  onAddComment: (msg: string) => void;
}

export const CycleDrawer: React.FC<CycleDrawerProps> = ({ 
  cycle, 
  onClose, 
  onUpdateStatus, 
  evidences, 
  comments,
  history,
  onAddEvidence,
  onDeleteEvidence,
  onAddComment
}) => {
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'evidences' | 'comments' | 'history' | 'approval'>('evidences');

  if (!cycle) return null;

  const daysDiff = differenceInCalendarDays(new Date(cycle.due_date), new Date());
  const dueInfo = daysDiff < 0 
    ? { text: `Atrasado há ${Math.abs(daysDiff)} dias`, color: 'text-[#FF4D4F]' }
    : daysDiff === 0 
    ? { text: 'Vence hoje', color: 'text-[#FFB020]' }
    : { text: `Vence em ${daysDiff} dias`, color: 'text-[#6B7280]' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-[540px] bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E6E8EB] flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={cycle.area?.name.toLowerCase() as any}>{cycle.area?.name}</Badge>
              <Badge variant={cycle.status}>{cycle.status}</Badge>
            </div>
            <h2 className="text-xl font-bold text-[#0B1220] truncate mb-1">{cycle.routine?.title}</h2>
            <RiskIndicator score={cycle.routine?.risk_score} />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F8] rounded-full text-[#6B7280] transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Mini Stats Bar */}
        <div className="px-6 py-4 bg-[#F7F7F8]/50 border-b border-[#E6E8EB] grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF] mb-1">Status do Ciclo</p>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#0A63FF]" />
              <span className="text-sm font-bold text-[#0B1220]">{dueInfo.text}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-[#9CA3AF] mb-1">Assertividade Área</p>
            <p className="text-lg font-bold text-[#00B37E]">94%</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="px-6 py-3 bg-[#F7F7F8] flex items-center gap-2">
          {cycle.status === 'in_review' ? (
             <Button size="sm" variant="primary" className="bg-[#722ED1] hover:bg-[#531DAB]">
               <UserCheck size={16} className="mr-2" /> Aprovar Etapa
             </Button>
          ) : cycle.status !== 'done' ? (
            <Button size="sm" variant="success" onClick={() => onUpdateStatus(cycle.id, 'done')}>
              <Check size={16} className="mr-2" /> Finalizar
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(cycle.id, 'in_progress')}>
              Reabrir
            </Button>
          )}
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="p-2 min-w-0"><LinkIcon size={16} /></Button>
          <Button size="sm" variant="ghost" className="p-2 min-w-0"><StickyNote size={16} /></Button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-[#E6E8EB]">
          {[
            { id: 'evidences', label: 'Evidências', count: evidences.length },
            { id: 'approval', label: 'Workflow', icon: ShieldCheck },
            { id: 'comments', label: 'Comentários', count: comments.length },
            { id: 'history', label: 'Histórico', icon: History }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab.id ? 'border-[#0A63FF] text-[#0A63FF]' : 'border-transparent text-[#6B7280]'
              }`}
            >
              {tab.icon && <tab.icon size={14} />}
              {tab.label} {tab.count !== undefined && <span className="opacity-50">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FBFBFC]">
          {activeTab === 'approval' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E6E8EB] rounded-2xl p-4 mb-4">
                <p className="text-xs font-bold text-[#6B7280] uppercase mb-3 tracking-wide">Fluxo de Aprovação Sequencial</p>
                <div className="space-y-4">
                   {cycle.approval_steps ? cycle.approval_steps.map((step, idx) => (
                     <div key={idx} className="flex gap-4 items-start relative">
                       {idx < cycle.approval_steps!.length - 1 && (
                         <div className="absolute left-4 top-8 bottom-[-16px] w-px bg-[#E6E8EB]" />
                       )}
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 ${
                         step.status === 'approved' ? 'bg-[#E6FAF2] border-[#00B37E] text-[#00B37E]' : 
                         step.status === 'pending' ? 'bg-white border-[#E6E8EB] text-[#6B7280]' : 'bg-[#FFF2F0] border-[#FF4D4F] text-[#FF4D4F]'
                       }`}>
                         {step.status === 'approved' ? <Check size={14} /> : <span className="text-[10px] font-bold">{step.order}</span>}
                       </div>
                       <div className="flex-1 pt-0.5">
                         <p className={`text-sm font-bold ${step.status === 'pending' ? 'text-[#6B7280]' : 'text-[#0B1220]'}`}>
                           {step.user_name}
                         </p>
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">{step.status}</span>
                            {step.completed_at && <span className="text-[10px] text-[#9CA3AF]">{format(new Date(step.completed_at), "dd/MM HH:mm")}</span>}
                         </div>
                       </div>
                     </div>
                   )) : (
                     <p className="text-sm text-[#6B7280] italic">Este ciclo não requer aprovações adicionais.</p>
                   )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evidences' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#E6E8EB] bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-[#0A63FF] hover:bg-[#E6F0FF]/20 transition-all cursor-pointer group">
                <div className="p-3 bg-[#F7F7F8] rounded-2xl mb-3 group-hover:bg-[#0A63FF] group-hover:text-white transition-all">
                  <Paperclip size={24} />
                </div>
                <p className="text-sm font-bold text-[#0B1220]">Upload de Evidência</p>
                <p className="text-xs text-[#6B7280]">Integração com Google Drive e SharePoint habilitada</p>
              </div>

              {evidences.map((ev) => (
                <div key={ev.id} className="bg-white border border-[#E6E8EB] rounded-2xl p-4 flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-[#F7F7F8] rounded-xl text-[#6B7280]">
                      {ev.type === 'file' ? <Paperclip size={18} /> : ev.type === 'link' ? <LinkIcon size={18} /> : <StickyNote size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0B1220]">{ev.title}</p>
                      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Anexado por Owner</p>
                    </div>
                  </div>
                  <button onClick={() => onDeleteEvidence(ev.id)} className="p-2 text-[#9CA3AF] hover:text-[#FF4D4F] transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 group">
                  <img src={`https://picsum.photos/seed/${comment.author_id}/100`} className="w-9 h-9 rounded-full ring-2 ring-[#F7F7F8]" alt="" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#0B1220]">{comment.author_name}</span>
                      <span className="text-[10px] font-bold text-[#9CA3AF]">{format(new Date(comment.created_at), "dd MMM, HH:mm")}</span>
                    </div>
                    <div className="bg-white border border-[#E6E8EB] rounded-2xl rounded-tl-none p-3 text-sm text-[#0B1220] shadow-sm">
                      {comment.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
             <div className="space-y-6 relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-[#E6E8EB] z-0" />
              {history.map((entry) => (
                <div key={entry.id} className="flex gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E6E8EB] flex items-center justify-center text-[#0A63FF] shrink-0 shadow-sm">
                    <History size={14} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs font-bold text-[#0B1220]">{entry.action}</p>
                    <p className="text-xs text-[#6B7280] mb-1">{entry.details}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">{entry.user_name}</span>
                      <span className="text-[10px] font-bold text-[#9CA3AF]">•</span>
                      <span className="text-[10px] font-bold text-[#9CA3AF]">{format(new Date(entry.created_at), "dd/MM HH:mm")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Input */}
        {activeTab === 'comments' && (
          <div className="p-6 border-t border-[#E6E8EB] bg-white">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escreva um comentário..."
                className="w-full bg-[#F7F7F8] border border-transparent rounded-2xl py-4 pl-5 pr-14 text-sm resize-none shadow-inner shadow-[#0A63FF]/5 focus:border-[#0A63FF] focus:bg-white transition-all"
                rows={2}
              />
              <button 
                onClick={() => {
                  if (commentText.trim()) {
                    onAddComment(commentText);
                    setCommentText('');
                  }
                }}
                disabled={!commentText.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#0A63FF] text-white disabled:bg-gray-200 rounded-xl shadow-lg shadow-[#0A63FF]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};