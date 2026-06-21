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

export async function deleteCliente(clienteId: string) {
  try {
    // 1. Eliminar visitas asociadas (para evitar error de Foreign Key Constraint)
    const { error: visitasError } = await supabaseAdmin
      .from('visitas')
      .delete()
      .eq('cliente_id', clienteId);
      
    if (visitasError) throw visitasError;

    // 2. Eliminar al cliente
    const { error: clienteError } = await supabaseAdmin
      .from('clientes')
      .delete()
      .eq('id', clienteId);

    if (clienteError) throw clienteError;

    return { success: true };
  } catch (error: any) {
    console.error('Error en deleteCliente:', error);
    return { success: false, error: error.message || 'Error interno al eliminar cliente' };
  }
}

export async function createClienteAdmin(data: {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  total_visitas: number;
}) {
  try {
    // Verificar si el teléfono ya existe
    const { data: existente } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('telefono', data.telefono)
      .single();

    if (existente) {
      return { success: false, error: 'Ya existe un cliente con este teléfono.' };
    }

    const { data: nuevo, error } = await supabaseAdmin
      .from('clientes')
      .insert({
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        email: data.email,
        total_visitas: data.total_visitas,
        visitas: data.total_visitas,
        fecha_ultima_visita: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    // Si tiene más de 0 visitas, podemos opcionalmente crear un registro en visitas,
    // pero para no complicar el historial lo dejamos así. Las visitas totales ya están seteadas.

    return { success: true, cliente: nuevo };
  } catch (error: any) {
    console.error('Error en createClienteAdmin:', error);
    return { success: false, error: error.message || 'Error al crear cliente' };
  }
}
