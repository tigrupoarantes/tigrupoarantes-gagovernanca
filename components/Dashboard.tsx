
import React from 'react';
import { GovernanceCycle, CycleStatus } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { AlertCircle, CheckCircle2, Clock, PlayCircle, ExternalLink, MessageCircle, FilePlus, BrainCircuit, UserCheck } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
import { RiskIndicator } from './RiskIndicator';

interface DashboardProps {
  cycles: GovernanceCycle[];
  onOpenCycle: (cycle: GovernanceCycle) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ cycles, onOpenCycle }) => {
  const stats = {
    late: cycles.filter(c => c.status === 'late').length,
    vencendo: cycles.filter(c => {
      const days = differenceInCalendarDays(new Date(c.due_date), new Date());
      return c.status !== 'done' && days >= 0 && days <= 7;
    }).length,
    inReview: cycles.filter(c => c.status === 'in_review').length,
    done: cycles.filter(c => c.status === 'done').length,
  };

  const criticalCycles = cycles
    .filter(c => c.status !== 'done')
    .sort((a, b) => {
        // Sort by risk if available, else by date
        const riskA = a.routine?.risk_score || 0;
        const riskB = b.routine?.risk_score || 0;
        return riskB - riskA;
    })
    .slice(0, 8);

  const KpiCard = ({ icon: Icon, label, value, color, bgColor }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-[#E6E8EB] shadow-sm flex items-center gap-4 group hover:border-[#0A63FF] transition-all cursor-default">
      <div className={`p-4 rounded-xl ${bgColor}`}>
        <Icon className={color} size={28} />
      </div>
      <div>
        <p className="text-sm text-[#6B7280] font-medium">{label}</p>
        <p className="text-3xl font-bold text-[#0B1220] tracking-tight">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1220] tracking-tight">Central Intelligence</h1>
          <p className="text-[#6B7280]">Monitoramento preditivo e aprovações em tempo real.</p>
        </div>
        <div className="bg-[#E6F0FF] px-4 py-2 rounded-xl flex items-center gap-3 border border-[#0A63FF]/20">
           <BrainCircuit className="text-[#0A63FF]" size={20} />
           <div>
             <p className="text-[10px] font-bold uppercase text-[#0A63FF] leading-none mb-1">Health Score</p>
             <p className="text-sm font-bold text-[#0B1220]">Conformidade: 88.5%</p>
           </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={AlertCircle} label="Atrasados" value={stats.late} color="text-[#FF4D4F]" bgColor="bg-[#FFF2F0]" />
        <KpiCard icon={Clock} label="Vencendo (7d)" value={stats.vencendo} color="text-[#FFB020]" bgColor="bg-[#FFF9EB]" />
        <KpiCard icon={UserCheck} label="Em Aprovação" value={stats.inReview} color="text-[#722ED1]" bgColor="bg-[#F0E6FF]" />
        <KpiCard icon={CheckCircle2} label="Concluídos" value={stats.done} color="text-[#00B37E]" bgColor="bg-[#E6FAF2]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attention List with Risk */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E6E8EB] shadow-sm flex flex-col h-[520px]">
          <div className="p-6 border-b border-[#E6E8EB] flex items-center justify-between">
            <h3 className="font-bold text-[#0B1220]">Fila de Prioridade (IA)</h3>
            <Badge variant="priority-critical">Ação Imediata</Badge>
          </div>
          <div className="flex-1 overflow-y-auto">
            {criticalCycles.length > 0 ? (
              <div className="divide-y divide-[#E6E8EB]">
                {criticalCycles.map((cycle) => {
                  const daysDiff = differenceInCalendarDays(new Date(cycle.due_date), new Date());
                  return (
                    <div key={cycle.id} className="p-4 hover:bg-[#F7F7F8] transition-all group flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-[#0B1220] group-hover:text-[#0A63FF] transition-colors cursor-pointer" onClick={() => onOpenCycle(cycle)}>
                            {cycle.routine?.title}
                          </h4>
                          {cycle.status === 'in_review' && <Badge variant="in_review">Aprovação</Badge>}
                        </div>
                        <div className="flex flex-col gap-1">
                           <RiskIndicator score={cycle.routine?.risk_score} />
                           <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                            <span className="font-bold text-[#0A63FF]">{cycle.area?.name}</span>
                            <span>•</span>
                            <span>{daysDiff < 0 ? `Atrasado há ${Math.abs(daysDiff)} d` : `Vence em ${daysDiff} d`}</span>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white rounded-lg text-[#6B7280] hover:text-[#0A63FF] shadow-sm border border-[#E6E8EB]" onClick={() => onOpenCycle(cycle)}><ExternalLink size={16}/></button>
                        <button className="p-2 hover:bg-white rounded-lg text-[#6B7280] hover:text-[#00B37E] shadow-sm border border-[#E6E8EB]"><CheckCircle2 size={16}/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <CheckCircle2 size={48} className="text-[#00B37E] mb-2" />
                <p className="font-medium">Tudo sob controle!</p>
              </div>
            )}
          </div>
        </div>

        {/* Global Calendar Widget */}
        <div className="bg-white rounded-2xl border border-[#E6E8EB] shadow-sm flex flex-col h-[520px]">
          <div className="p-6 border-b border-[#E6E8EB] flex justify-between items-center">
            <h3 className="font-bold text-[#0B1220]">Visão Calendário</h3>
            <Button size="sm" variant="ghost" className="text-[10px] uppercase font-bold text-[#0A63FF]">Sincronizar</Button>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
             <div className="grid grid-cols-7 gap-1 mb-6 w-full max-w-[240px]">
                {Array.from({length: 31}).map((_, i) => (
                  <div key={i} className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${i === 15 ? 'bg-[#0A63FF] text-white shadow-lg' : i === 13 || i === 18 ? 'bg-[#FFF2F0] text-[#FF4D4F]' : 'bg-[#F7F7F8] text-[#6B7280]'}`}>
                    {i + 1}
                  </div>
                ))}
             </div>
             <div className="space-y-4 w-full text-left">
                <div className="p-3 bg-[#F7F7F8] rounded-xl border-l-4 border-[#FF4D4F]">
                   <p className="text-[10px] font-bold text-[#6B7280] uppercase">Próximo Marco Crítico</p>
                   <p className="text-xs font-bold text-[#0B1220]">Auditoria Q4 Externos</p>
                   <p className="text-[10px] text-[#6B7280]">Vence em 2 dias</p>
                </div>
                <div className="p-3 bg-[#F7F7F8] rounded-xl border-l-4 border-[#00B37E]">
                   <p className="text-[10px] font-bold text-[#6B7280] uppercase">Finalizado Hoje</p>
                   <p className="text-xs font-bold text-[#0B1220]">Checklist Backup Cloud</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
