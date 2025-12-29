
import React, { useState, useEffect } from 'react';
import { GovernanceArea, BusinessUnit, GovernanceRoutine, Profile, UserRole } from '../types';
import { Button } from './ui/Button';
import { Plus, Edit2, Trash2, Settings, Building, Target, FileUp, Download, Sparkles, Users, UserCheck, UserX, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminModuleProps {
  areas: GovernanceArea[];
  units: BusinessUnit[];
  routines: GovernanceRoutine[];
}

export const AdminModule: React.FC<AdminModuleProps> = ({ areas, units, routines }) => {
  const [activeTab, setActiveTab] = useState<'areas' | 'units' | 'routines' | 'templates' | 'users'>('areas');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    setLoadingUsers(false);
  };

  const toggleUserActive = async (user: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ active: !user.active })
      .eq('user_id', user.user_id);
    if (!error) {
      setUsers(users.map(u => u.user_id === user.user_id ? { ...u, active: !u.active } : u));
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('user_id', userId);
    if (!error) {
      setUsers(users.map(u => u.user_id === userId ? { ...u, role } : u));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1220] tracking-tight">Administração Pro</h1>
          <p className="text-sm text-[#6B7280]">Gestão de infraestrutura, governança e acessos.</p>
        </div>
        <div className="flex gap-2">
          {activeTab !== 'users' && (
            <>
              <Button variant="secondary" onClick={() => alert('Baixando Modelo CSV...')}>
                <Download size={18} className="mr-2" /> Modelo CSV
              </Button>
              <Button>
                <Plus size={18} className="mr-2" /> Novo
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="flex border-b border-[#E6E8EB] overflow-x-auto bg-white rounded-t-2xl">
        {[
          { id: 'areas', label: 'Áreas', icon: Settings },
          { id: 'units', label: 'Unidades', icon: Building },
          { id: 'routines', label: 'Rotinas', icon: Target },
          { id: 'users', label: 'Usuários', icon: Users },
          { id: 'templates', label: 'Templates IA', icon: Sparkles },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'border-[#0A63FF] text-[#0A63FF] bg-[#E6F0FF]/50' 
              : 'border-transparent text-[#6B7280] hover:text-[#0B1220]'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E6E8EB] rounded-b-2xl overflow-hidden shadow-sm">
        {activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F7F7F8] border-b border-[#E6E8EB]">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase">Usuário</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase">Cargo / Acesso</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8EB]">
                {users.map(user => (
                  <tr key={user.user_id} className="hover:bg-[#F7F7F8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={`https://picsum.photos/seed/${user.user_id}/100`} className="w-8 h-8 rounded-full border border-[#E6E8EB]" alt="" />
                        <div>
                          <p className="font-bold text-[#0B1220] text-sm">{user.full_name}</p>
                          <p className="text-xs text-[#6B7280]">ID: {user.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <select 
                          value={user.role}
                          onChange={(e) => updateUserRole(user.user_id, e.target.value as UserRole)}
                          className="bg-white border border-[#E6E8EB] rounded-lg px-2 py-1 text-xs font-bold text-[#0B1220] focus:ring-1 ring-[#0A63FF] outline-none"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="owner">Owner</option>
                          <option value="director">Director</option>
                          <option value="admin">Admin</option>
                        </select>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${user.active ? 'bg-[#E6FAF2] text-[#00B37E]' : 'bg-[#FFF2F0] text-[#FF4D4F]'}`}>
                          {user.active ? 'Ativo' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant={user.active ? 'danger' : 'success'} 
                        onClick={() => toggleUserActive(user)}
                        className="text-[10px] font-bold uppercase py-1 h-auto"
                      >
                        {user.active ? <><UserX size={12} className="mr-1"/> Bloquear</> : <><UserCheck size={12} className="mr-1"/> Ativar</>}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="p-12 text-center text-[#6B7280]">Nenhum usuário cadastrado.</div>}
          </div>
        ) : activeTab === 'templates' ? (
          <div className="p-12 text-center max-w-lg mx-auto">
             <div className="w-16 h-16 bg-[#E6F0FF] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0A63FF]">
                <Sparkles size={32} />
             </div>
             <h3 className="text-lg font-bold text-[#0B1220] mb-2">Smart Templates</h3>
             <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">Frameworks pré-configurados (COSO, ISO, SOX).</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F7F7F8] border-b border-[#E6E8EB]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase">Identificação</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase">Status / Info</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#9CA3AF] uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EB]">
              {activeTab === 'areas' && areas.map(area => (
                <tr key={area.id} className="hover:bg-[#F7F7F8]">
                  <td className="px-6 py-4 font-bold text-[#0B1220]">{area.name}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{area.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-[#6B7280] hover:text-[#0A63FF]"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'routines' && routines.map(routine => (
                <tr key={routine.id} className="hover:bg-[#F7F7F8]">
                  <td className="px-6 py-4 font-bold text-[#0B1220]">{routine.title}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280] capitalize">{routine.frequency} • {routine.priority}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-[#6B7280] hover:text-[#0A63FF]"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
