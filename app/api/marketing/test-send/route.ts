import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { formatUnsplashUrl } from '@/lib/unsplash';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (!session?.value) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { subject, message, imageUrl, to, recipients, isBirthday, rouletteLink } = await request.json();

    const { data: configRows } = await supabaseAdmin.from('config').select('clave, valor');
    const config = (configRows || []).reduce((acc: Record<string, string>, item) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});

    if (!config?.resend_api_key) {
      return NextResponse.json({ error: 'No se encontró la API Key de Resend en Configuración' }, { status: 400 });
    }

    const resend = new Resend(config.resend_api_key);
    const waBase = `https://wa.me/${(config.admin_whatsapp || '').replace(/\D/g, '')}`;

    let targetRecipients: any[] = [];
    if (to === 'BROADCAST' && Array.isArray(recipients)) {
      targetRecipients = recipients;
    } else if (typeof to === 'string' && to !== 'BROADCAST') {
      targetRecipients = [{ email: to, nombre: 'Amigo/a' }];
    }

    if (targetRecipients.length === 0) {
      return NextResponse.json({ error: 'No hay destinatarios' }, { status: 400 });
    }

    // Enviar correos individualizados para personalizar {nombre} en el asunto y cuerpo
    const sendPromises = targetRecipients.map(async (rec) => {
      const email = typeof rec === 'string' ? rec : rec.email;
      const nombre = typeof rec === 'string' ? 'Amigo/a' : (rec.nombre || 'Amigo/a');
      
      const customSubject = subject.replace(/\{nombre\}/gi, nombre);
      const customMessage = message.replace(/\{nombre\}/gi, nombre);
      
      const buttonLink = isBirthday && rouletteLink ? rouletteLink : `${waBase}?text=Hola, deseo consultar mi premio`;
      const buttonLabel = isBirthday && rouletteLink ? 'GIRAR MI RULETA 🎁' : isBirthday ? 'RESERVAR MI MESA 🥂' : 'CONSULTAR MI BENEFICIO';

      return resend.emails.send({
        from: 'La Travesía <onboarding@resend.dev>',
        to: [email],
        subject: customSubject,
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
            ${imageUrl ? `<img src="${formatUnsplashUrl(imageUrl)}" style="width: 100%; height: auto; display: block;" alt="Campaña" />` : ''}
            <div style="padding: 40px; text-align: center;">
              <h1 style="color: #4A5D4E; margin-bottom: 20px; font-size: 28px;">¡Hola ${nombre}!</h1>
              <p style="color: #666; font-size: 18px; line-height: 1.6;">${customMessage}</p>
              <div style="margin-top: 40px;">
                <a href="${buttonLink}"
                   style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 2px;">
                  ${buttonLabel}
                </a>
              </div>
              <p style="margin-top: 40px; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Hostería La Travesía</p>
            </div>
          </div>
        `,
      });
    });

    const results = await Promise.all(sendPromises);
    
    // Validar si hubo algún error en los envíos individuales
    const errors = results.filter(r => r.error);
    if (errors.length > 0 && errors.length === results.length) {
      return NextResponse.json({ error: errors[0].error?.message || 'Error al enviar correos' }, { status: 400 });
    }

    return NextResponse.json({ success: true, sentCount: results.length - errors.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
