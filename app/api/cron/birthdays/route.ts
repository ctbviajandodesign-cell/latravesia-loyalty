import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

import { formatUnsplashUrl } from '@/lib/unsplash';

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
    const mes = String(today.getMonth() + 1).padStart(2, '0');
    const dia = String(today.getDate()).padStart(2, '0');
    const target = `-${mes}-${dia}`;

    const { data: clientes } = await supabase.from('clientes').select('nombre, email, fecha_nacimiento');
    
    // Filtrar solo los que cumplen años HOY
    const cumpleaneros = clientes?.filter(c => c.fecha_nacimiento?.endsWith(target)) || [];

    if (cumpleaneros.length === 0) {
      return NextResponse.json({ message: 'No hay cumpleaños hoy' });
    }

    // Usar las nuevas llaves de configuración del Marketing Hub
    const subject = config.birthday_email_subject || '¡Feliz Cumpleaños! 🥂';
    const body = config.birthday_email_body || 'Hola {nombre}, te deseamos lo mejor en tu día.';
    const imageUrl = formatUnsplashUrl(config.birthday_image_url || '');

    const results = await Promise.all(cumpleaneros.map(cliente => 
      resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email],
        subject: subject,
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
            ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; height: auto; display: block;" alt="Cumpleaños" />` : ''}
            <div style="padding: 40px; text-align: center;">
              <h1 style="color: #4A5D4E; margin-bottom: 20px; font-size: 28px;">¡Feliz Cumpleaños, ${cliente.nombre}!</h1>
              <p style="color: #666; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                ${body.replace('{nombre}', cliente.nombre)}
              </p>
              <div style="margin-top: 40px;">
                <a href="https://wa.me/${(config.admin_whatsapp || '').replace(/\D/g, '')}?text=Hola, deseo reservar para mi cumpleaños" 
                   style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 2px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
                  RESERVAR MI MESA
                </a>
              </div>
              <p style="margin-top: 40px; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px;">
                Hostería La Travesía • Solo Sábados y Domingos
              </p>
            </div>
          </div>
        `
      })
    ));

    return NextResponse.json({ success: true, sent_to: cumpleaneros.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
