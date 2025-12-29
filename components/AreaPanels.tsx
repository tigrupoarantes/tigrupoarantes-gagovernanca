
import React, { useState } from 'react';
import { GovernanceArea, GovernanceRoutine, GovernanceCycle } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
// Added AlertCircle to the imports
import { LayoutGrid, List, Search, ArrowRight, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { RiskIndicator } from './RiskIndicator';

interface AreaPanelsProps {
  areas: GovernanceArea[];
  routines: GovernanceRoutine[];
  cycles: GovernanceCycle[];
  onOpenCycle: (cycle: GovernanceCycle) => void;
}

export const AreaPanels: React.FC<AreaPanelsProps> = ({ areas, routines, cycles, onOpenCycle }) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id || '');

  const filteredRoutines = routines.filter(r => r.area_id === selectedAreaId);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1220] tracking-tight">Painéis por Área</h1>
          <p className="text-sm text-[#6B7280]">Visão modular com indicadores preditivos.</p>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {areas.map(area => (
          <button
            key={area.id}
            onClick={() => setSelectedAreaId(area.id)}
            className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
              selectedAreaId === area.id 
              ? 'bg-[#0A63FF] border-[#0A63FF] text-white shadow-xl shadow-[#0A63FF]/20' 
              : 'bg-white border-[#E6E8EB] text-[#6B7280] hover:border-[#0A63FF] hover:text-[#0A63FF]'
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutines.map(routine => {
          const cycle = cycles.find(c => c.routine_id === routine.id);
          return (
            <div key={routine.id} className="bg-white border border-[#E6E8EB] rounded-2xl p-6 hover:shadow-2xl hover:border-[#0A63FF] transition-all group cursor-default relative overflow-hidden">
              {routine.risk_score && routine.risk_score > 70 && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFF2F0] rounded-bl-[40px] flex items-center justify-center text-[#FF4D4F] pl-4 pb-4">
                   <AlertCircle size={20} />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <Badge variant={routine.priority as any}>{routine.priority}</Badge>
                {cycle && <Badge variant={cycle.status}>{cycle.status}</Badge>}
              </div>
              
              <h3 className="font-bold text-[#0B1220] text-lg mb-2 group-hover:text-[#0A63FF] transition-colors leading-snug">{routine.title}</h3>
              <div className="mb-4">
                <RiskIndicator score={routine.risk_score} />
              </div>

              <div className="space-y-3 mb-6 bg-[#F7F7F8] p-3 rounded-xl border border-transparent group-hover:border-[#E6E8EB] transition-all">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-[#9CA3AF]">
                  <span>Frequência</span>
                  <span className="text-[#0B1220]">{routine.frequency}</span>
                </div>
                {routine.approval_chain && (
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-[#9CA3AF]">
                    <span>Workflow</span>
                    <span className="text-[#722ED1] flex items-center gap-1">
                       <ShieldCheck size={12} /> Habilitado
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {routine.owners?.map((owner, i) => (
                    <img key={i} src={owner.avatar_url} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="Owner" />
                  ))}
                </div>
                {cycle && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="shadow-md"
                    onClick={() => onOpenCycle(cycle)}
                  >
                    Detalhes <ArrowRight size={14} className="ml-1" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
