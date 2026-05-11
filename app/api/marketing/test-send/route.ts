import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatUnsplashUrl } from '@/lib/unsplash';

export async function POST(request: Request) {
  try {
    const { subject, message, imageUrl, to, recipients } = await request.json();

    // 1. Obtener la API Key de Supabase
    const { data: configData } = await supabase
      .from('config')
      .select('valor')
      .eq('clave', 'resend_api_key')
      .single();

    if (!configData?.valor) {
      return NextResponse.json({ error: 'No se encontró la API Key de Resend en Configuración' }, { status: 400 });
    }

    const resend = new Resend(configData.valor);

    // 2. Determinar destinatarios
    let targetEmails: string[] = [];
    if (to === 'BROADCAST' && Array.isArray(recipients)) {
      targetEmails = recipients;
    } else {
      targetEmails = [to];
    }

    if (targetEmails.length === 0) {
      return NextResponse.json({ error: 'No hay destinatarios' }, { status: 400 });
    }

    // 3. Enviar correos (Resend permite enviar a varios en un solo llamado si es el mismo mensaje)
    // Nota: Para grandes volúmenes se recomienda usar lotes o una cola de tareas.
    const { data, error } = await resend.emails.send({
      from: 'La Travesía <onboarding@resend.dev>',
      to: targetEmails,
      subject: subject,
      html: `
        <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          <img src="${formatUnsplashUrl(imageUrl)}" style="width: 100%; height: auto; display: block;" alt="Campaña" />
          <div style="padding: 40px; text-align: center; background-color: #ffffff;">
            <h1 style="color: #4A5D4E; margin-bottom: 20px;">¡Hola!</h1>
            <p style="color: #666; font-size: 18px; line-height: 1.6;">${message.replace('{nombre}', 'Amigo/a')}</p>
            <div style="margin-top: 40px;">
              <a href="https://latravesia-loyalty82.vercel.app" style="background-color: #D4AF37; color: #4A5D4E; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; letter-spacing: 2px;">RESERVAR MI MESA</a>
            </div>
            <p style="margin-top: 40px; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Hostería La Travesía • Solo Sábados y Domingos</p>
          </div>
        </div>
      `
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
