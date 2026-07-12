'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendNotification } from '@/app/actions/notifications';
import { getEcuadorDateString } from '@/lib/date';

export async function checkPhoneExists(countryCode: string, localPhone: string) {
  // First, exact match with both columns
  let { data: existing } = await supabaseAdmin
    .from('clientes')
    .select('id')
    .eq('codigo_pais', countryCode)
    .eq('telefono', localPhone)
    .limit(1)
    .maybeSingle();

  // If no exact match and it has at least 9 digits, try a fallback using like on the local part
  if (!existing && localPhone.length >= 9) {
    const fallbackLocal = localPhone.slice(-9);
    const { data: fallbackData } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .like('telefono', `%${fallbackLocal}%`)
      .limit(1)
      .maybeSingle();
    existing = fallbackData;
  }
  
  return { exists: !!existing };
}

export async function checkEmailExists(email: string) {
  const { data: existing } = await supabaseAdmin
    .from('clientes').select('id').ilike('email', email.trim()).limit(1).maybeSingle();
  
  return { exists: !!existing };
}

export async function registerNewClient(dbData: any, countryCode: string, localPhone: string, premio: string) {
  const hoy = getEcuadorDateString();
  
  try {
    const { data, error } = await supabaseAdmin
      .from('clientes')
      .insert([{ ...dbData, codigo_pais: countryCode, telefono: localPhone, total_visitas: 1, visitas: 1, fecha_ultima_visita: hoy }])
      .select().single();
      
    if (error) throw error;
    
    await supabaseAdmin.from('visitas').insert([{ cliente_id: data.id, fecha: hoy, premio_ganado: premio }]);
    
    sendNotification('BIRTHDAY_WELCOME', data).catch(console.error);
    
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
