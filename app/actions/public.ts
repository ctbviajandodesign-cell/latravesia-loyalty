'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function getCheckinInitialData(clienteId: string) {
  const hoy = new Date().toISOString().split('T')[0];
  
  const [cRes, mRes, vRes] = await Promise.all([
    supabaseAdmin.from('clientes').select('nombre, apellido, total_visitas').eq('id', clienteId).maybeSingle(),
    supabaseAdmin.from('config').select('valor').eq('clave', 'visitas_para_premio').maybeSingle(),
    supabaseAdmin.from('visitas').select('id').eq('cliente_id', clienteId).eq('fecha', hoy)
  ]);

  return {
    cliente: cRes.data,
    meta: parseInt(mRes.data?.valor || '10'),
    alreadyToday: vRes.data && vRes.data.length > 0 ? true : false
  };
}

export async function getConfig(keys: string[]) {
  const { data } = await supabaseAdmin.from('config').select('clave, valor').in('clave', keys);
  if (!data) return {};
  
  const m: Record<string, string> = {};
  data.forEach(({ clave, valor }) => { if (valor) m[clave] = valor; });
  return m;
}

export async function getAllConfig() {
  const { data } = await supabaseAdmin.from('config').select('clave, valor');
  if (!data) return {};
  
  const m: Record<string, string> = {};
  data.forEach(({ clave, valor }) => { if (valor) m[clave] = valor; });
  return m;
}
