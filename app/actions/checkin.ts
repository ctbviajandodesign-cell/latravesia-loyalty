'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { getCurrentDailyCode } from './daily-code';
import { sendNotification } from './notifications';
import { getEcuadorDateString } from '@/lib/date';

export async function findClientByPhone(countryCode: string, localPhone: string) {
  // 1. Try exact match
  const response = await supabaseAdmin
    .from('clientes')
    .select('id, nombre, apellido, total_visitas, fecha_ultima_visita')
    .eq('codigo_pais', countryCode)
    .eq('telefono', localPhone)
    .limit(1)
    .maybeSingle();
    
  let data = response.data;

  // 2. If not found, try matching the local part (last 9 digits)
  if (!data && localPhone.length >= 9) {
    const fallbackLocal = localPhone.slice(-9);
    const { data: fallbackData } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre, apellido, total_visitas, fecha_ultima_visita')
      .like('telefono', `%${fallbackLocal}%`)
      .limit(1)
      .maybeSingle();
    
    data = fallbackData;
  }

  if (!data) {
    return { error: 'Número no encontrado. Si eres nuevo, regístrate.' };
  }

  return { cliente: data };
}

export async function validateCheckin(clienteId: string, code: string) {
  const today = getEcuadorDateString();

  const currentCode = await getCurrentDailyCode();
  if (code.trim() !== currentCode.trim()) {
    return { error: 'Código incorrecto. Pídelo al personal del local.' };
  }

  const { data: cliente } = await supabaseAdmin
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .maybeSingle();

  if (!cliente) return { error: 'Cliente no encontrado.' };

  if (cliente.fecha_ultima_visita === today) {
    const { data: metaRowDup } = await supabaseAdmin
      .from('config').select('valor').eq('clave', 'visitas_para_premio').maybeSingle();
    return {
      error: '¡Ya registraste tu visita de hoy!',
      alreadyToday: true,
      cliente,
      nuevasVisitas: cliente.total_visitas as number,
      meta: parseInt(metaRowDup?.valor || '10'),
    };
  }

  const { data: metaRow } = await supabaseAdmin
    .from('config').select('valor').eq('clave', 'visitas_para_premio').maybeSingle();
  const meta = parseInt(metaRow?.valor || '10');

  const nuevasVisitas = (cliente.total_visitas || 0) + 1;

  await supabaseAdmin.from('clientes').update({
    total_visitas: nuevasVisitas,
    visitas: nuevasVisitas,
    fecha_ultima_visita: today,
  }).eq('id', clienteId);

  await supabaseAdmin.from('visitas')
    .insert({ cliente_id: clienteId, fecha: today })
    .then(() => null, () => null);

  if (nuevasVisitas === meta) {
    sendNotification('LOYALTY_REWARD', { ...cliente, total_visitas: nuevasVisitas }).catch(console.error);
  } else if (nuevasVisitas > 1 && nuevasVisitas < meta) {
    sendNotification('VISIT_PROGRESS', { ...cliente, total_visitas: nuevasVisitas }, meta).catch(console.error);
  }

  const showReview = nuevasVisitas === 3;

  return {
    success: true,
    cliente: { ...cliente, total_visitas: nuevasVisitas, fecha_ultima_visita: today },
    nuevasVisitas,
    meta,
    showReview,
  };
}
