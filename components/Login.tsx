
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Mail, Lock, Chrome, User, ArrowRight, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem. Verifique e tente novamente.');
          return;
        }

        // Ao criar conta, enviamos os metadados em formatos comuns (full_name e name)
        // para garantir compatibilidade com qualquer Trigger que o banco possua.
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              name: fullName, // Fallback para triggers que buscam por 'name'
            }
          }
        });
        
        if (error) {
          // Tratamento específico para o erro de Trigger do Supabase
          if (error.message.includes("Database error saving new user")) {
            throw new Error("Erro interno do servidor ao salvar perfil. Por favor, contate o administrador para verificar as permissões da tabela 'profiles'.");
          }
          throw error;
        } else {
          setSuccess(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F8] p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#E6FAF2] text-[#00B37E] rounded-full flex items-center justify-center mx-auto">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#0B1220]">Conta solicitada!</h2>
          <p className="text-[#6B7280]">
            Sua conta foi criada. No entanto, por questões de segurança, um administrador precisa **ativar seu perfil** no painel administrativo antes do seu primeiro acesso.
          </p>
          <Button onClick={() => setSuccess(false)} variant="secondary" className="w-full">
            Voltar para Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-inter">
      {/* Coluna Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A63FF] p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0A63FF] font-bold text-xl">GA</div>
            <span className="text-2xl font-bold tracking-tight text-white">Governança</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">Controle estratégico<br/>em nível executivo.</h1>
          <p className="text-blue-100 text-lg max-w-md">Decisões baseadas em evidências, conformidade radical e clareza para o C-Level.</p>
        </div>
        
        <div className="z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
          <p className="text-sm italic">"A visibilidade imediata de riscos mudou nossa forma de gerir compliance."</p>
          <p className="text-xs font-bold mt-2 uppercase tracking-wider opacity-60">— Grupo Arantes</p>
        </div>

        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />
      </div>

      {/* Coluna Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#0B1220]">{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
            <p className="text-[#6B7280] mt-2">Acesse ou crie sua central de comando estratégica.</p>
          </div>

          <div className="flex bg-[#F7F7F8] p-1 rounded-2xl">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-white text-[#0A63FF] shadow-sm' : 'text-[#6B7280]'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-[#0A63FF] shadow-sm' : 'text-[#6B7280]'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-[#6B7280] tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F7F7F8] border border-transparent rounded-xl focus:bg-white focus:border-[#0A63FF] transition-all outline-none"
                    placeholder="Seu nome"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#6B7280] tracking-wider">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#F7F7F8] border border-transparent rounded-xl focus:bg-white focus:border-[#0A63FF] transition-all outline-none"
                  placeholder="exemplo@empresa.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#6B7280] tracking-wider">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#F7F7F8] border border-transparent rounded-xl focus:bg-white focus:border-[#0A63FF] transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-[#6B7280] tracking-wider">Repetir Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F7F7F8] border border-transparent rounded-xl focus:bg-white focus:border-[#0A63FF] transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-[#FFF2F0] border border-[#FF4D4F]/20 rounded-xl flex gap-3 items-start">
                <AlertCircle className="text-[#FF4D4F] shrink-0" size={16} />
                <p className="text-[#FF4D4F] text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full py-4" disabled={loading}>
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar no Dashboard' : 'Solicitar Acesso'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E6E8EB]"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-[#9CA3AF] font-bold">Ou continue com</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-[#E6E8EB] rounded-xl text-sm font-bold text-[#0B1220] hover:bg-[#F7F7F8] transition-all"
          >
            <Chrome size={18} /> Google Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
