import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    "[Atlas] Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY " +
      "em apps/web/.env ou .env.local para habilitar a integração. Veja .env.example.",
  );
}

// O client só é instanciado quando as credenciais reais existem, evitando
// o uso de valores fictícios apenas para satisfazer a assinatura do createClient.
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper único para os services (transactionsService/billsService/goalsService)
// evitarem repetir a mesma checagem de "cliente configurado" em cada arquivo.
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente.");
  }

  return supabase;
}
