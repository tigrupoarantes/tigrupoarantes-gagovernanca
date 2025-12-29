import { createClient } from '@supabase/supabase-js';

type AnyRecord = Record<string, any>;

// Helper to safely get environment variables in Vite/browser builds.
// Priority: import.meta.env (when available) → process.env (via Vite `define`) → window.env.
const getEnv = (key: string): string => {
  try {
    const metaEnv = (import.meta as AnyRecord)?.env as AnyRecord | undefined;
    const fromMeta = metaEnv?.[key];
    if (typeof fromMeta === 'string' && fromMeta.length > 0) return fromMeta;

    const procEnv = (typeof process !== 'undefined' ? (process as AnyRecord).env : undefined) as AnyRecord | undefined;
    const fromProcess = procEnv?.[key];
    if (typeof fromProcess === 'string' && fromProcess.length > 0) return fromProcess;

    const winEnv = (typeof window !== 'undefined' ? (window as AnyRecord).env : undefined) as AnyRecord | undefined;
    const fromWindow = winEnv?.[key];
    if (typeof fromWindow === 'string' && fromWindow.length > 0) return fromWindow;
  } catch (e) {
    console.warn(`Error accessing environment variable ${key}:`, e);
  }
  return '';
};

const supabaseUrl =
  getEnv('VITE_SUPABASE_URL') ||
  getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
  'https://atskuowlanuupeutpppi.supabase.co';

// Suporte tanto ao nome padrão quanto ao nome específico fornecido pelo Supabase no print
const supabaseAnonKey =
  getEnv('VITE_SUPABASE_ANON_KEY') ||
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0c2t1b3dsYW51dXBldXRwcHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjQ0MDAsImV4cCI6MjA4MjU0MDQwMH0.zxIS9BV7r27ap4JQHhO9xy8FhO0zvjBYV5WseX-y3gg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testConnection = async () => {
  try {
    // 1) Auth endpoint reachability (does not require DB tables)
    const { error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;

    // 2) DB/schema reachability (expects at least one governance_* table to exist)
    const { error: dbError } = await supabase.from('governance_areas').select('id').limit(1);
    if (dbError) throw dbError;

    return { success: true as const, message: 'Conectado ao Supabase (Auth + DB OK)' };
  } catch (error: any) {
    console.error('Erro de conexão Supabase:', error);
    return {
      success: false as const,
      message: error?.message || 'Falha ao conectar no Supabase'
    };
  }
};
