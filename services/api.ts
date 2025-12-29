
import { supabase } from '../lib/supabase';
import { GovernanceCycle, CycleStatus, GovernanceArea, GovernanceRoutine, BusinessUnit } from '../types';

export const api = {
  // Chamada RPC crítica do PRD para gerar ciclos faltantes
  ensureCycles: async (from: string, to: string) => {
    const { error } = await supabase.rpc('ensure_governance_cycles', {
      p_from: from,
      p_to: to
    });
    if (error) {
      console.error('Erro no RPC ensure_cycles:', error);
      throw new Error(error.message || 'Falha ao garantir ciclos de governança.');
    }
  },

  // Busca de Metadados
  getAreas: async () => {
    const { data, error } = await supabase
      .from('governance_areas')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message || 'Erro ao carregar áreas.');
    return data as GovernanceArea[];
  },

  getUnits: async () => {
    const { data, error } = await supabase
      .from('business_units')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw new Error(error.message || 'Erro ao carregar unidades de negócio.');
    return data as BusinessUnit[];
  },

  getRoutines: async () => {
    const { data, error } = await supabase
      .from('governance_routines')
      .select(`
        *,
        owners:governance_routine_owners(profiles(*)),
        scope:governance_routine_scope(business_units(*))
      `)
      .eq('is_active', true);
    
    if (error) throw new Error(error.message || 'Erro ao carregar rotinas.');
    
    return data.map(r => ({
      ...r,
      owners: r.owners?.map((o: any) => o.profiles).filter(Boolean) || [],
      scope: r.scope?.map((s: any) => s.business_units).filter(Boolean) || []
    })) as GovernanceRoutine[];
  },

  // Busca de Ciclos Operacionais com Join Aninhado
  getCycles: async (from: string, to: string) => {
    const { data, error } = await supabase
      .from('governance_cycles')
      .select(`
        *,
        routine:governance_routines(
          *,
          area:governance_areas(*)
        )
      `)
      .gte('due_date', from)
      .lte('due_date', to)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Erro detalhado ao buscar ciclos:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Erro ao carregar ciclos operacionais.');
    }
    
    // Mapeamos os dados para que 'area' fique no nível superior do objeto,
    // extraindo-o de dentro da rotina para manter compatibilidade com o restante do app.
    return (data as any[]).map(cycle => ({
      ...cycle,
      area: cycle.routine?.area
    })) as GovernanceCycle[];
  },

  updateCycleStatus: async (id: string, status: CycleStatus) => {
    const { error } = await supabase
      .from('governance_cycles')
      .update({ 
        status, 
        completed_at: status === 'done' ? new Date().toISOString() : null 
      })
      .eq('id', id);
    if (error) throw new Error(error.message || 'Erro ao atualizar status do ciclo.');
  },

  getEvidences: async (cycleId: string) => {
    const { data, error } = await supabase
      .from('governance_evidences')
      .select('*')
      .eq('cycle_id', cycleId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message || 'Erro ao carregar evidências.');
    return data;
  },

  getComments: async (cycleId: string) => {
    const { data, error } = await supabase
      .from('governance_comments')
      .select(`
        *,
        author:profiles(full_name)
      `)
      .eq('cycle_id', cycleId)
      .order('created_at', { ascending: true });
    
    if (error) throw new Error(error.message || 'Erro ao carregar comentários.');
    return data.map(c => ({
      ...c,
      author_name: c.author?.full_name
    }));
  },

  addComment: async (cycleId: string, userId: string, message: string) => {
    const { error } = await supabase
      .from('governance_comments')
      .insert([{ cycle_id: cycleId, author_id: userId, message }]);
    if (error) throw new Error(error.message || 'Erro ao adicionar comentário.');
  },

  uploadEvidence: async (cycleId: string, file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `governance/${cycleId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('governance-evidences')
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message || 'Erro ao fazer upload do arquivo.');

    const { error: dbError } = await supabase
      .from('governance_evidences')
      .insert([{
        cycle_id: cycleId,
        type: 'file',
        title: file.name,
        url: filePath,
        created_by: userId
      }]);

    if (dbError) throw new Error(dbError.message || 'Erro ao registrar evidência no banco.');
  }
};
