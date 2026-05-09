import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const formatImageUrl = (url: string) => {
  if (!url) return '';
  const unsplashRegex = /unsplash\.com\/(?:[a-z]{2}\/fotos\/|photos\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(unsplashRegex);
  if (match && match[1]) {
    return `https://images.unsplash.com/photo-${match[1]}?auto=format&fit=crop&q=80&w=1000`;
  }
  return url;
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('No autorizado', { status: 401 });
  }

  try {
    const { data: configRows } = await supabase.from('config').select('*');
    const config = configRows?.reduce((acc: any, item: any) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});

    if (!config?.resend_api_key) throw new Error('Falta Resend API Key');
    const resend = new Resend(config.resend_api_key);

    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 6);

    const { data: clientes } = await supabase.from('clientes').select('nombre, email, fecha_nacimiento');
    
    const cumpleañeros = clientes?.filter(c => {
      if (!c.fecha_nacimiento || !c.email) return false;
      const [, m, d] = c.fecha_nacimiento.split('-').map(Number);
      const bday = new Date(today.getFullYear(), m - 1, d);
      return bday >= today && bday <= endOfWeek;
    }) || [];

    if (cumpleañeros.length === 0) {
      return NextResponse.json({ message: 'No hay cumpleaños esta semana' });
    }

    const results = await Promise.all(cumpleañeros.map(cliente => 
      resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email],
        subject: config.email_asunto,
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
            <img src="${formatImageUrl(config.email_foto_url)}" style="width: 100%; height: auto; display: block;" alt="Cumpleaños" />
            <div style="padding: 40px; text-align: center; background-color: #ffffff;">
              <h1 style="color: #4A5D4E; margin-bottom: 20px;">¡Hola, ${cliente.nombre}!</h1>
              <p style="color: #666; font-size: 18px; line-height: 1.6;">${config.email_mensaje.replace('{nombre}', cliente.nombre)}</p>
              <div style="margin-top: 40px;">
                <a href="https://latravesia-loyalty82.vercel.app" style="background-color: #D4AF37; color: #4A5D4E; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; letter-spacing: 2px;">RESERVAR MI MESA</a>
              </div>
            </div>
          </div>
        `
      })
    ));

    return NextResponse.json({ success: true, sent_to: cumpleañeros.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
