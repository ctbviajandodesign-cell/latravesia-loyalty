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
        subject: config.email_asunto,
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
            <img src="${formatImageUrl(config.email_foto_url)}" style="width: 100%; height: auto; display: block;" />
            <div style="padding: 40px; text-align: center; background-color: #ffffff;">
              <h1 style="color: #4A5D4E;">¡Bienvenido y Feliz Cumpleaños!</h1>
              <p style="color: #666; font-size: 18px;">${config.email_mensaje.replace('{nombre}', cliente.nombre)}</p>
              <div style="margin-top: 40px;">
                <a href="https://latravesia-loyalty82.vercel.app" style="background-color: #D4AF37; color: #4A5D4E; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">RESERVAR AHORA</a>
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
        subject: config.email_premio_asunto || '¡Felicidades por tu fidelidad! 🏆',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; text-align: center;">
            <img src="${formatImageUrl(config.email_premio_foto_url)}" style="width: 100%; height: auto; display: block;" />
            <div style="padding: 40px;">
              <h1 style="color: #4A5D4E;">¡META CUMPLIDA!</h1>
              <p style="font-size: 18px; color: #666;">${(config.email_premio_mensaje || '').replace('{nombre}', cliente.nombre)}</p>
              <p style="margin-top: 30px; font-size: 12px; color: #999;">Muestra este correo en tu próxima visita para validarlo.</p>
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
