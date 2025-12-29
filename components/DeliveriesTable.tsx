
import React, { useState } from 'react';
import { GovernanceCycle, CycleStatus } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Search, Download, Filter, ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeliveriesTableProps {
  cycles: GovernanceCycle[];
  onOpenCycle: (cycle: GovernanceCycle) => void;
}

export const DeliveriesTable: React.FC<DeliveriesTableProps> = ({ cycles, onOpenCycle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CycleStatus | 'all'>('all');

  const filtered = cycles.filter(c => {
    const matchesSearch = c.routine?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1220] tracking-tight">Entregas e Prazos</h1>
          <p className="text-sm text-[#6B7280]">Controle centralizado de todas as obrigações do período.</p>
        </div>
        <Button variant="secondary" onClick={() => alert('Exportando CSV...')}>
          <Download size={16} className="mr-2" /> Exportar CSV
        </Button>
      </header>

      <div className="bg-white border border-[#E6E8EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E6E8EB] flex items-center justify-between gap-4 bg-[#F7F7F8]">
          <div className="flex-1 max-w-sm relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Buscar por rotina..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E6E8EB] rounded-xl text-sm focus:outline-none focus:border-[#0A63FF] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="bg-white border border-[#E6E8EB] rounded-xl px-3 py-2 text-sm focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em andamento</option>
              <option value="done">Concluído</option>
              <option value="late">Atrasado</option>
            </select>
            <Button variant="secondary" size="md" className="min-w-0 p-2"><Filter size={16}/></Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F8] border-b border-[#E6E8EB]">
                <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Prazo</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Rotina / Área</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EB]">
              {filtered.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-[#F7F7F8] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-[#0B1220]">
                      {format(new Date(cycle.due_date), "dd/MM/yyyy")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-[#0B1220] group-hover:text-[#0A63FF] cursor-pointer" onClick={() => onOpenCycle(cycle)}>
                      {cycle.routine?.title}
                    </div>
                    <div className="text-xs text-[#6B7280]">{cycle.area?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={cycle.status}>{cycle.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img src={cycle.routine?.owners?.[0]?.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                      <span className="text-sm text-[#0B1220]">{cycle.routine?.owners?.[0]?.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-[#6B7280] hover:text-[#0B1220] rounded-lg">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-[#6B7280]">
              Nenhum registro encontrado para os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};