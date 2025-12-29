
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AreaPanels } from './components/AreaPanels';
import { DeliveriesTable } from './components/DeliveriesTable';
import { AdminModule } from './components/AdminModule';
import { CycleDrawer } from './components/CycleDrawer';
import { Login } from './components/Login';
import { useAuth } from './hooks/useAuth';
import { api } from './services/api';
import { GovernanceCycle, CycleStatus, GovernanceArea, GovernanceRoutine, BusinessUnit } from './types';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Button } from './components/ui/Button';
import { ShieldAlert, AlertTriangle, Loader2, UserX, RefreshCw } from 'lucide-react';
import { DateRange } from './components/ui/DateRangePicker';

const App: React.FC = () => {
  const { session, profile, loading: authLoading, signOut } = useAuth();
  const [cycles, setCycles] = useState<GovernanceCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<GovernanceCycle | null>(null);
  const [areas, setAreas] = useState<GovernanceArea[]>([]);
  const [routines, setRoutines] = useState<GovernanceRoutine[]>([]);
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado global do período
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    label: 'Este Mês'
  });

  const dataLoaded = useRef(false);
  const lastLoadedRange = useRef<string>('');

  useEffect(() => {
    if (!session) {
      dataLoaded.current = false;
      return;
    }

    const currentRangeKey = `${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}`;
    if (session && profile && profile.active && lastLoadedRange.current !== currentRangeKey) {
      loadInitialData();
    }
  }, [session, profile, dateRange]);

  const loadInitialData = async () => {
    setAppLoading(true);
    setError(null);
    
    try {
      const start = format(dateRange.start, 'yyyy-MM-dd');
      const end = format(dateRange.end, 'yyyy-MM-dd');

      // Atualiza a chave de cache antes de disparar
      lastLoadedRange.current = `${start}_${end}`;

      // Tenta garantir que os ciclos existam para o período selecionado
      await api.ensureCycles(start, end).catch(e => console.warn('Ciclos garantidos via manutenção:', e.message));

      const [areasData, routinesData, unitsData, cyclesData] = await Promise.all([
        api.getAreas(),
        api.getRoutines(),
        api.getUnits(),
        api.getCycles(start, end)
      ]);

      setAreas(areasData);
      setRoutines(routinesData);
      setUnits(unitsData);
      setCycles(cyclesData);
      
      dataLoaded.current = true;
    } catch (err: any) {
      console.error('Erro ao carregar dados da API:', err);
      setError(err?.message || 'Erro de conexão com o banco de dados. Verifique se as tabelas governance_* existem.');
    } finally {
      setAppLoading(false);
    }
  };

  const handleUpdateStatus = async (cycleId: string, status: CycleStatus) => {
    try {
      await api.updateCycleStatus(cycleId, status);
      setCycles(prev => prev.map(c => c.id === cycleId ? { ...c, status } : c));
      if (selectedCycle?.id === cycleId) {
        setSelectedCycle(prev => prev ? { ...prev, status } : null);
      }
    } catch (err: any) {
      alert('Erro operacional: ' + err.message);
    }
  };

  if (authLoading || (session && profile === undefined)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="w-10 h-10 text-[#0A63FF] animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold text-[#0B1220]">Validando Credenciais</p>
          <p className="text-xs text-[#6B7280]">Isso pode levar alguns segundos...</p>
        </div>
        <button onClick={() => window.location.reload()} className="mt-8 text-xs text-[#0A63FF] hover:underline flex items-center gap-1">
          <RefreshCw size={12} /> Se demorar muito, recarregar
        </button>
      </div>
    );
  }

  if (!session) return <Login />;

  if (profile === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F7F7F8] p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-[#E6E8EB] space-y-6">
          <div className="w-20 h-20 bg-[#FFF2F0] text-[#FF4D4F] rounded-full flex items-center justify-center mx-auto">
            <UserX size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1220]">Vínculo não encontrado</h1>
          <div className="text-[#6B7280] text-sm space-y-2">
            <p>Sua conta está autenticada, mas não há um perfil correspondente no banco.</p>
            <div className="p-3 bg-[#F7F7F8] rounded-xl font-mono text-[10px] break-all border border-[#E6E8EB]">UID: {session.user.id}</div>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()} className="w-full">Tentar Novamente</Button>
            <Button onClick={() => signOut()} variant="secondary" className="w-full">Sair</Button>
          </div>
        </div>
      </div>
    );
  }

  if (profile && !profile.active) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F7F7F8] p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-[#E6E8EB] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFB020] to-[#0A63FF]" />
          <div className="w-20 h-20 bg-[#FFF9EB] text-[#FFB020] rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1220]">Aguardando Liberação</h1>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Perfil de <span className="font-bold text-[#0B1220]">{profile.full_name}</span> aguardando habilitação administrativa.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => window.location.reload()} className="w-full font-bold">Já fui liberado, atualizar</Button>
            <Button onClick={() => signOut()} variant="ghost" className="w-full text-[#6B7280]">Sair da Conta</Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFF2F0] p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-[#FF4D4F]/20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-[#FF4D4F] mx-auto" />
          <h2 className="text-xl font-bold">Erro de Dados</h2>
          <p className="text-sm text-[#6B7280]">{error}</p>
          <Button onClick={() => loadInitialData()} className="w-full">Tentar Reconectar</Button>
          <Button onClick={() => signOut()} variant="ghost" className="w-full">Sair</Button>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout 
        user={profile} 
        notifications={[]} 
        onMarkRead={() => {}}
        onClearAll={() => {}}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onLogout={signOut}
      >
        {appLoading && cycles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="w-12 h-12 text-[#0A63FF] animate-spin" />
            <div className="text-center">
              <p className="text-lg font-bold text-[#0B1220]">Carregando Painéis</p>
              <p className="text-sm text-[#6B7280]">Buscando métricas para o período selecionado...</p>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard cycles={cycles} onOpenCycle={setSelectedCycle} />} />
            <Route path="/painels" element={<AreaPanels areas={areas} routines={routines} cycles={cycles} onOpenCycle={setSelectedCycle} />} />
            <Route path="/entregas" element={<DeliveriesTable cycles={cycles} onOpenCycle={setSelectedCycle} />} />
            <Route path="/admin" element={<AdminModule areas={areas} units={units} routines={routines} />} />
          </Routes>
        )}

        <CycleDrawer 
          cycle={selectedCycle}
          onClose={() => setSelectedCycle(null)}
          onUpdateStatus={handleUpdateStatus}
          evidences={[]}
          comments={[]}
          history={[]} 
          onAddComment={async (msg) => {
            if (selectedCycle) await api.addComment(selectedCycle.id, profile.user_id, msg);
          }}
          onAddEvidence={async () => {}}
          onDeleteEvidence={() => {}}
        />
      </Layout>
    </HashRouter>
  );
};

export default App;
