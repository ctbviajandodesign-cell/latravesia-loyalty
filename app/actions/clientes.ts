'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function canjearPremio(clienteId: string) {
  try {
    // 1. Obtener la meta actual
    const { data: metaRow } = await supabaseAdmin
      .from('config')
      .select('valor')
      .eq('clave', 'visitas_para_premio')
      .single();
      
    const meta = parseInt(metaRow?.valor || '10');

    // 2. Obtener el cliente
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('id, total_visitas')
      .eq('id', clienteId)
      .single();

    if (!cliente) return { success: false, error: 'Cliente no encontrado' };

    if ((cliente.total_visitas || 0) < meta) {
      return { success: false, error: 'El cliente no tiene visitas suficientes para un premio' };
    }

    // 3. Restar la meta
    const nuevasVisitas = (cliente.total_visitas || 0) - meta;

    const { error: updateError } = await supabaseAdmin
      .from('clientes')
      .update({ total_visitas: nuevasVisitas })
      .eq('id', clienteId);

    if (updateError) throw updateError;

    // 4. Registrar en el historial de visitas para analíticas (Premio Entregado)
    const today = new Date().toISOString().split('T')[0];
    await supabaseAdmin.from('visitas').insert({
      cliente_id: clienteId,
      fecha: today,
      premio_ganado: 'Canje de Meta'
    });

    return { success: true, nuevasVisitas };
  } catch (error: any) {
    console.error('Error en canjearPremio:', error);
    return { success: false, error: 'Error interno al canjear premio' };
  }
}
