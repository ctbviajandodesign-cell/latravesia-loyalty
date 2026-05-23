import { createClient } from '@supabase/supabase-js';

// Usa fallback para evitar crash en build time si la var no está definida.
// En producción SUPABASE_SERVICE_ROLE_KEY debe estar configurada en Vercel.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);
