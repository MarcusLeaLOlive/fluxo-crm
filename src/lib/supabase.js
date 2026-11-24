/**
 * Cliente do Supabase, criado só se as variáveis de ambiente existirem.
 * Sem elas, o app funciona no modo demonstração (dados no navegador).
 *
 * VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ficam no .env (veja .env.example).
 * A chave "anon" é pública por definição: quem protege os dados é o RLS do banco.
 */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env?.VITE_SUPABASE_URL;
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client = null;
export function getSupabase() {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
