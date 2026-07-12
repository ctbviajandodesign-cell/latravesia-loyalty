import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Vercel Cron solo soporta GET
export async function GET(request: Request) {
  // Asegurarnos que la peticion viene de Vercel Cron (opcional pero recomendado)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // Hacemos una consulta super ligera para mantener activa la base de datos
    const { data, error } = await supabaseAdmin
      .from('config')
      .select('clave')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase ping exitoso (Keepalive)',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error en keepalive cron:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
