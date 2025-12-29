
import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface RiskIndicatorProps {
  score?: number;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ score = 0 }) => {
  const getColor = () => {
    if (score > 75) return 'text-[#FF4D4F]';
    if (score > 40) return 'text-[#FFB020]';
    return 'text-[#00B37E]';
  };

  const getLabel = () => {
    if (score > 75) return 'Alto Risco';
    if (score > 40) return 'Risco Médio';
    return 'Baixo Risco';
  };

  return (
    <div className={`flex items-center gap-1.5 ${getColor()} transition-all`}>
      <BrainCircuit size={14} className="animate-pulse" />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        Propensão a atraso: {score}% ({getLabel()})
      </span>
    </div>
  );
};
