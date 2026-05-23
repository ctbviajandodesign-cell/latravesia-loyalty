'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function getCurrentDailyCode(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabaseAdmin
    .from('config')
    .select('clave, valor')
    .in('clave', ['pin_validacion', 'pin_fecha']);

  const cfg = Object.fromEntries((data || []).map((r) => [r.clave, r.valor]));

  if (cfg.pin_fecha === today && cfg.pin_validacion) return cfg.pin_validacion;

  // Rotar automáticamente a medianoche
  return rotateDailyCode();
}

export async function rotateDailyCode(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const newPin = String(Math.floor(1000 + Math.random() * 9000));

  await supabaseAdmin.from('config').upsert([
    { clave: 'pin_validacion', valor: newPin },
    { clave: 'pin_fecha', valor: today },
  ]);

  return newPin;
}
