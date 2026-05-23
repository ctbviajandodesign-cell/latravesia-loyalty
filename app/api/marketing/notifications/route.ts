import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { formatUnsplashUrl } from '@/lib/unsplash';
import { resolveUnsplashUrl } from '@/app/actions/unsplash';

// Este endpoint es solo para llamadas internas autorizadas.
// El flujo normal (registro, check-in) usa app/actions/notifications.ts
export async function POST(request: Request) {
  const secret = request.headers.get('x-internal-secret');
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { type, cliente } = await request.json();

    const { data: configRows } = await supabaseAdmin.from('config').select('clave, valor');
    const config = (configRows || []).reduce((acc: Record<string, string>, item) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});

    if (!config?.resend_api_key) throw new Error('Falta API Key');
    const resend = new Resend(config.resend_api_key);
    const waBase = `https://wa.me/${(config.admin_whatsapp || '').replace(/\D/g, '')}`;

    if (type === 'BIRTHDAY_WELCOME') {
      const rawImage = config.welcome_image_url || config.email_foto_url || '';
      const resolvedImage = await resolveUnsplashUrl(rawImage);

      await resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email],
        subject: config.welcome_email_subject || '¡Bienvenido al Club!',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
            ${resolvedImage ? `<img src="${resolvedImage}" style="width: 100%; height: auto; display: block;" />` : ''}
            <div style="padding: 40px; text-align: center;">
              <h1 style="color: #4A5D4E; font-size: 28px;">¡Hola ${cliente.nombre}!</h1>
              <p style="color: #666; font-size: 18px; line-height: 1.6;">
                ${(config.welcome_email_body || '').replace('{nombre}', cliente.nombre)}
              </p>
              <div style="margin-top: 40px;">
                <a href="${waBase}?text=Hola, acabo de registrarme"
                   style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold;">
                  CONSULTAR MIS BENEFICIOS
                </a>
              </div>
            </div>
          </div>
        `,
      });
    }

    if (type === 'LOYALTY_REWARD') {
      const rawImage = config.loyalty_image_url || config.email_foto_url || '';
      const resolvedImage = await resolveUnsplashUrl(rawImage);

      await resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [cliente.email],
        subject: config.loyalty_email_subject || '¡Felicidades por tu fidelidad!',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; text-align: center; background-color: #ffffff;">
            ${resolvedImage ? `<img src="${resolvedImage}" style="width: 100%; height: auto; display: block;" />` : ''}
            <div style="padding: 40px;">
              <h1 style="color: #4A5D4E; font-size: 28px;">¡META CUMPLIDA!</h1>
              <p style="font-size: 18px; color: #666; line-height: 1.6;">
                ${(config.loyalty_email_body || '').replace('{nombre}', cliente.nombre)}
              </p>
              <div style="margin-top: 40px;">
                <a href="${waBase}?text=Hola, he completado mis visitas"
                   style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold;">
                  RECLAMAR MI PREMIO
                </a>
              </div>
            </div>
          </div>
        `,
      });

      if (config.admin_email) {
        await resend.emails.send({
          from: 'Sistema Loyalty <onboarding@resend.dev>',
          to: [config.admin_email],
          subject: `PREMIO LISTO: ${cliente.nombre} ${cliente.apellido}`,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 2px solid #D4AF37; border-radius: 10px;"><h2>Cliente completó sus visitas</h2><p><b>${cliente.nombre} ${cliente.apellido}</b></p></div>`,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
