
import { GovernanceArea, GovernanceRoutine, GovernanceCycle, Profile, BusinessUnit, GovernanceEvidence, GovernanceComment, ApprovalStep } from '../types';
import { addDays, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

export const mockProfiles: Profile[] = [
  { user_id: '1', full_name: 'Executivo Admin', role: 'admin', active: true, created_at: '2023-01-01', avatar_url: 'https://picsum.photos/seed/admin/100' },
  { user_id: '2', full_name: 'João Silva', role: 'owner', active: true, created_at: '2023-01-01', avatar_url: 'https://picsum.photos/seed/joao/100' },
  { user_id: '3', full_name: 'Maria Clara', role: 'director', active: true, created_at: '2023-01-01', avatar_url: 'https://picsum.photos/seed/maria/100' },
  { user_id: '4', full_name: 'Carlos Finance', role: 'director', active: true, created_at: '2023-01-01', avatar_url: 'https://picsum.photos/seed/carlos/100' },
];

export const mockAreas: GovernanceArea[] = [
  { id: 'a1', name: 'Financeiro', description: 'Governança de fluxos financeiros e auditoria', sort_order: 1, created_at: '2023-01-01' },
  { id: 'a2', name: 'Compliance', description: 'Gestão de riscos e conformidade legal', sort_order: 2, created_at: '2023-01-01' },
  { id: 'a3', name: 'Operações', description: 'Eficiência operacional e SLAs', sort_order: 3, created_at: '2023-01-01' },
];

export const mockUnits: BusinessUnit[] = [
  { id: 'u1', code: 'HQ', name: 'Headquarters', created_at: '2023-01-01' },
  { id: 'u2', code: 'BR-SP', name: 'Filial São Paulo', created_at: '2023-01-01' },
];

export const mockRoutines: GovernanceRoutine[] = [
  { 
    id: 'r1', area_id: 'a1', title: 'Fechamento Contábil Mensal', frequency: 'monthly', 
    day_of_month: 5, priority: 'critical', is_active: true, created_at: '2023-01-01',
    owners: [mockProfiles[1]], scope: [mockUnits[0]],
    risk_score: 82, approval_chain: ['3', '4']
  },
  { 
    id: 'r2', area_id: 'a2', title: 'Revisão de Riscos Trimestral', frequency: 'quarterly', 
    priority: 'high', is_active: true, created_at: '2023-01-01',
    owners: [mockProfiles[2]], scope: [mockUnits[0], mockUnits[1]],
    risk_score: 15
  },
  { 
    id: 'r3', area_id: 'a3', title: 'Checklist de Segurança Semanal', frequency: 'weekly', 
    priority: 'medium', is_active: true, created_at: '2023-01-01',
    owners: [mockProfiles[1]], scope: [mockUnits[1]],
    risk_score: 40
  },
];

export const generateMockCycles = (): GovernanceCycle[] => {
  const today = new Date();
  
  const approvalStepsR1: ApprovalStep[] = [
    { user_id: '3', user_name: 'Maria Clara', status: 'approved', order: 1, completed_at: subDays(today, 1).toISOString() },
    { user_id: '4', user_name: 'Carlos Finance', status: 'pending', order: 2 }
  ];

  return [
    { 
      id: 'c1', routine_id: 'r1', due_date: format(addDays(today, -2), 'yyyy-MM-dd'), 
      status: 'late', created_at: '2023-01-01',
      routine: mockRoutines[0], area: mockAreas[0]
    },
    { 
      id: 'c2', routine_id: 'r2', due_date: format(addDays(today, 3), 'yyyy-MM-dd'), 
      status: 'pending', created_at: '2023-01-01',
      routine: mockRoutines[1], area: mockAreas[1]
    },
    { 
      id: 'c3', routine_id: 'r3', due_date: format(today, 'yyyy-MM-dd'), 
      status: 'in_progress', created_at: '2023-01-01',
      routine: mockRoutines[2], area: mockAreas[2]
    },
    { 
      id: 'c5', routine_id: 'r1', due_date: format(addDays(today, -1), 'yyyy-MM-dd'), 
      status: 'in_review', created_at: '2023-10-20',
      routine: mockRoutines[0], area: mockAreas[0],
      approval_steps: approvalStepsR1
    },
    { 
      id: 'c4', routine_id: 'r1', due_date: format(addDays(today, -10), 'yyyy-MM-dd'), 
      status: 'done', created_at: '2023-01-01', completed_at: addDays(today, -11).toISOString(),
      routine: mockRoutines[0], area: mockAreas[0]
    }
  ];
};

export const mockEvidences: GovernanceEvidence[] = [
  { id: 'e1', cycle_id: 'c4', type: 'file', title: 'Relatorio_Q3.pdf', url: '#', created_by: '2', created_at: '2023-10-01' },
  { id: 'e2', cycle_id: 'c3', type: 'link', title: 'Dashboard BI', url: 'https://google.com', created_by: '2', created_at: '2023-10-02' },
];

export const mockComments: GovernanceComment[] = [
  { id: 'm1', cycle_id: 'c1', author_id: '3', author_name: 'Maria Clara', message: 'Por que o fechamento está atrasado?', created_at: subDays(new Date(), 1).toISOString() },
  { id: 'm2', cycle_id: 'c1', author_id: '2', author_name: 'João Silva', message: 'Aguardando extratos do banco.', created_at: new Date().toISOString() },
];