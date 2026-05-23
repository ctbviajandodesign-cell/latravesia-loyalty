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
    const { subject, message, imageUrl, to, recipients } = await request.json();

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

    let targetEmails: string[] = [];
    if (to === 'BROADCAST' && Array.isArray(recipients)) {
      targetEmails = recipients;
    } else if (typeof to === 'string' && to !== 'BROADCAST') {
      targetEmails = [to];
    }

    if (targetEmails.length === 0) {
      return NextResponse.json({ error: 'No hay destinatarios' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'La Travesía <onboarding@resend.dev>',
      to: targetEmails,
      subject,
      html: `
        <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
          <img src="${formatUnsplashUrl(imageUrl)}" style="width: 100%; height: auto; display: block;" alt="Campaña" />
          <div style="padding: 40px; text-align: center;">
            <h1 style="color: #4A5D4E; margin-bottom: 20px; font-size: 28px;">¡Hola!</h1>
            <p style="color: #666; font-size: 18px; line-height: 1.6;">${message.replace('{nombre}', 'Amigo/a')}</p>
            <div style="margin-top: 40px;">
              <a href="${waBase}?text=Hola, deseo consultar mi premio"
                 style="background-color: #D4AF37; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 2px;">
                CONSULTAR MI BENEFICIO
              </a>
            </div>
            <p style="margin-top: 40px; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px;">Hostería La Travesía</p>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
