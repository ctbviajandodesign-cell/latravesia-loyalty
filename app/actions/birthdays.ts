'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';
import { resolveUnsplashUrl } from '@/app/actions/unsplash';
import { getEcuadorMonthDay } from '@/lib/date';

export async function triggerBirthdayEmails() {
  try {
    const { data: configRows } = await supabaseAdmin.from('config').select('*');
    const config = configRows?.reduce((acc: any, item: any) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});

    if (!config?.resend_api_key) throw new Error('Falta Resend API Key');
    const resend = new Resend(config.resend_api_key);

    const target = getEcuadorMonthDay();

    const { data: clientes } = await supabaseAdmin.from('clientes').select('nombre, email, fecha_nacimiento');
    const cumpleaneros = clientes?.filter(c => c.fecha_nacimiento?.endsWith(target)) || [];

    if (cumpleaneros.length === 0) {
      return { success: false, message: 'No hay cumpleaños hoy para enviar.' };
    }

    const subject = config.birthday_email_subject || '¡Feliz Cumpleaños! 🥂';
    const body = config.birthday_email_body || 'Hola {nombre}, te deseamos lo mejor en tu día.';
    const rawImageUrl = config.birthday_image_url || '';
    const imageUrl = await resolveUnsplashUrl(rawImageUrl);

    await Promise.all(cumpleaneros.map(cliente => 
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

    return { success: true, message: `Regalos enviados a ${cumpleaneros.length} cumpleañeros.` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
