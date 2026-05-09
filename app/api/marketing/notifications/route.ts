import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { type, cliente, config } = await request.json();

    // 1. Obtener API Key de Supabase
    const { data: configRows } = await supabase.from('config').select('*');
    const configData = configRows?.reduce((acc: any, item: any) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});

    if (!configData?.resend_api_key) throw new Error('Falta API Key');
    const resend = new Resend(configData.resend_api_key);

    if (type === 'BIRTHDAY_WELCOME') {
      // Enviar invitación de cumpleaños inmediata
      await resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email],
        subject: configData.email_asunto,
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
            <img src="${configData.email_foto_url}" style="width: 100%; height: auto; display: block;" />
            <div style="padding: 40px; text-align: center; background-color: #ffffff;">
              <h1 style="color: #4A5D4E;">¡Bienvenido y Feliz Cumpleaños!</h1>
              <p style="color: #666; font-size: 18px;">${configData.email_mensaje.replace('{nombre}', cliente.nombre)}</p>
              <div style="margin-top: 40px;">
                <a href="https://latravesia-loyalty82.vercel.app" style="background-color: #D4AF37; color: #4A5D4E; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">RESERVAR AHORA</a>
              </div>
            </div>
          </div>
        `
      });
    }

    if (type === 'LOYALTY_REWARD') {
      // 1. Correo al Cliente
      await resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email],
        subject: '¡Felicidades! Tienes un Premio Ganado 🏆',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; text-align: center; padding: 40px;">
            <h1 style="color: #4A5D4E;">¡META CUMPLIDA!</h1>
            <p style="font-size: 18px; color: #666;">Hola ${cliente.nombre}, has completado tus ${configData.visitas_para_premio} visitas con nosotros.</p>
            <p style="font-weight: bold; color: #D4AF37; font-size: 24px;">¡TU PREMIO ESTÁ LISTO!</p>
            <p>Muestra este correo en tu próxima visita para reclamarlo.</p>
          </div>
        `
      });

      // 2. Correo al Administrador
      if (configData.admin_email) {
        await resend.emails.send({
          from: 'Sistema Loyalty <onboarding@resend.dev>',
          to: [configData.admin_email],
          subject: `⚠️ PREMIO LISTO: ${cliente.nombre} ${cliente.apellido}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 2px solid #D4AF37; border-radius: 10px;">
              <h2>¡Un cliente ha completado su tarjeta!</h2>
              <p><b>Cliente:</b> ${cliente.nombre} ${cliente.apellido}</p>
              <p><b>Teléfono:</b> ${cliente.telefono}</p>
              <p><b>Email:</b> ${cliente.email}</p>
              <p><b>Visitas completadas:</b> ${configData.visitas_para_premio}</p>
              <hr />
              <p>Por favor, ten listo su premio para cuando regrese.</p>
            </div>
          `
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
