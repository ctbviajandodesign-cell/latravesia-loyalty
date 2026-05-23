'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { formatUnsplashUrl } from '@/lib/unsplash';
import { resolveUnsplashUrl } from './unsplash';
import type { Cliente, ConfigMap } from '@/types';

async function loadConfig(): Promise<ConfigMap> {
  const { data } = await supabaseAdmin.from('config').select('clave, valor');
  return (data || []).reduce((acc: ConfigMap, row) => {
    acc[row.clave] = row.valor;
    return acc;
  }, {});
}

export async function sendNotification(
  type: 'BIRTHDAY_WELCOME' | 'LOYALTY_REWARD',
  cliente: Partial<Cliente>
) {
  try {
    const config = await loadConfig();
    if (!config.resend_api_key) return;

    const resend = new Resend(config.resend_api_key);
    const waBase = `https://wa.me/${(config.admin_whatsapp || '').replace(/\D/g, '')}`;

    if (type === 'BIRTHDAY_WELCOME') {
      const rawImage = config.welcome_image_url || config.welcome_email_image_url || config.email_foto_url || '';
      const resolvedImage = await resolveUnsplashUrl(rawImage);

      await resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email!],
        subject: config.welcome_email_subject || '¡Bienvenido al Club!',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
            ${resolvedImage ? `<img src="${resolvedImage}" style="width: 100%; height: auto; display: block;" />` : ''}
            <div style="padding: 40px; text-align: center;">
              <h1 style="color: #4A5D4E; font-size: 28px;">¡Hola ${cliente.nombre}!</h1>
              <p style="color: #666; font-size: 18px; line-height: 1.6;">
                ${(config.welcome_email_body || config.email_mensaje || '').replace('{nombre}', cliente.nombre || '')}
              </p>
              <div style="margin-top: 40px;">
                <a href="${waBase}?text=Hola, acabo de registrarme y deseo consultar mis beneficios"
                   style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 2px;">
                  CONSULTAR MIS BENEFICIOS
                </a>
              </div>
            </div>
          </div>
        `,
      });
    }

    if (type === 'LOYALTY_REWARD') {
      const rawImage = config.loyalty_image_url || config.email_foto_url || config.email_premio_foto_url || '';
      const resolvedImage = await resolveUnsplashUrl(rawImage);

      await resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email!],
        subject: config.loyalty_email_subject || '¡Felicidades por tu fidelidad!',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; text-align: center; background-color: #ffffff;">
            ${resolvedImage ? `<img src="${resolvedImage}" style="width: 100%; height: auto; display: block;" />` : ''}
            <div style="padding: 40px;">
              <h1 style="color: #4A5D4E; font-size: 28px;">¡META CUMPLIDA!</h1>
              <p style="font-size: 18px; color: #666; line-height: 1.6;">
                ${(config.loyalty_email_body || config.email_premio_mensaje || '').replace('{nombre}', cliente.nombre || '')}
              </p>
              <div style="margin-top: 40px;">
                <a href="${waBase}?text=Hola, he completado mis visitas y deseo consultar mi premio"
                   style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 2px;">
                  RECLAMAR MI PREMIO
                </a>
              </div>
              <p style="margin-top: 30px; font-size: 12px; color: #999;">Hostería La Travesía</p>
            </div>
          </div>
        `,
      });

      if (config.admin_email) {
        await resend.emails.send({
          from: 'Sistema Loyalty <onboarding@resend.dev>',
          to: [config.admin_email],
          subject: `PREMIO LISTO: ${cliente.nombre} ${cliente.apellido}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 2px solid #D4AF37; border-radius: 10px;">
              <h2>Un cliente ha completado sus visitas</h2>
              <p><b>Cliente:</b> ${cliente.nombre} ${cliente.apellido}</p>
              <p><b>Visitas completadas:</b> ${config.visitas_para_premio}</p>
            </div>
          `,
        });
      }
    }
  } catch {
    // Silencia errores de email para no bloquear el flujo del cliente
  }
}
