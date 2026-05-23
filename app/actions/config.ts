'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function saveConfigValue(id: string, valor: string): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from('config')
    .update({ valor })
    .eq('id', id);

  if (error) return { error: error.message };
  return {};
}
