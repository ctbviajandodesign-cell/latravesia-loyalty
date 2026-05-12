import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

import { formatUnsplashUrl } from '@/lib/unsplash';

export async function POST(request: Request) {
  try {
    const { type, cliente } = await request.json();

    // 1. Obtener configuración
    const { data: configRows } = await supabase.from('config').select('*');
    const config = configRows?.reduce((acc: any, item: any) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});

    if (!config?.resend_api_key) throw new Error('Falta API Key');
    const resend = new Resend(config.resend_api_key);

    if (type === 'BIRTHDAY_WELCOME') {
      await resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email],
        subject: config.welcome_email_subject || '¡Bienvenido al Club! ✨',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
            <img src="${formatUnsplashUrl(config.welcome_image_url || config.welcome_email_image_url || config.email_foto_url)}" style="width: 100%; height: auto; display: block;" />
            <div style="padding: 40px; text-align: center;">
              <h1 style="color: #4A5D4E; font-size: 28px;">¡Hola ${cliente.nombre}!</h1>
              <p style="color: #666; font-size: 18px; line-height: 1.6;">${(config.welcome_email_body || config.email_mensaje || '').replace('{nombre}', cliente.nombre)}</p>
              <div style="margin-top: 40px;">
                <a href="https://wa.me/${(config.admin_whatsapp || '').replace(/\D/g, '')}?text=Hola, acabo de registrarme y deseo consultar mis beneficios" 
                   style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 2px;">
                  CONSULTAR MIS BENEFICIOS
                </a>
              </div>
            </div>
          </div>
        `
      });
    }

    if (type === 'LOYALTY_REWARD') {
      // Correo dinámico al Cliente
      await resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email],
        subject: config.loyalty_email_subject || '¡Felicidades por tu fidelidad! 🏆',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; text-align: center; background-color: #ffffff;">
            <img src="${formatUnsplashUrl(config.loyalty_image_url || config.email_foto_url || config.email_premio_foto_url)}" style="width: 100%; height: auto; display: block;" />
            <div style="padding: 40px;">
              <h1 style="color: #4A5D4E; font-size: 28px;">¡META CUMPLIDA!</h1>
              <p style="font-size: 18px; color: #666; line-height: 1.6;">${(config.loyalty_email_body || config.email_premio_mensaje || '').replace('{nombre}', cliente.nombre)}</p>
              <div style="margin-top: 40px;">
                <a href="https://wa.me/${(config.admin_whatsapp || '').replace(/\D/g, '')}?text=Hola, he completado mis visitas y deseo consultar mi premio" 
                   style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 2px;">
                  RECLAMAR MI PREMIO
                </a>
              </div>
              <p style="margin-top: 30px; font-size: 12px; color: #999;">Hostería La Travesía • Solo Sábados y Domingos</p>
            </div>
          </div>
        `
      });

      // Correo al Administrador (para estar atentos)
      if (config.admin_email) {
        await resend.emails.send({
          from: 'Sistema Loyalty <onboarding@resend.dev>',
          to: [config.admin_email],
          subject: `⚠️ PREMIO LISTO: ${cliente.nombre} ${cliente.apellido}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 2px solid #D4AF37; border-radius: 10px;">
              <h2>¡Un cliente ha completado sus visitas!</h2>
              <p><b>Cliente:</b> ${cliente.nombre} ${cliente.apellido}</p>
              <p><b>Visitas completadas:</b> ${config.visitas_para_premio}</p>
              <p>Prepárate para entregar su beneficio.</p>
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
