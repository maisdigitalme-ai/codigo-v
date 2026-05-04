import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

// Forçar a rota a ser dinâmica para evitar cache da Vercel
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook received:', JSON.stringify(body));

    // Mapeamento Coringa para E-mail (Ainda mais flexível)
    const customerEmail = 
      body.customer?.email || 
      body.email || 
      body.data?.customer?.email ||
      body.data?.object?.customer_email || 
      body.data?.email || 
      body.payer?.email || 
      body.usr_email || 
      body.client?.email;

    // Mapeamento Coringa para Nome
    const customerName = 
      body.customer?.name || 
      body.name || 
      body.data?.customer?.name ||
      body.data?.object?.customer_name || 
      body.data?.name || 
      body.payer?.name || 
      body.usr_name || 
      body.client?.name || 
      'Cliente';

    // Mapeamento Coringa para Produto
    const productName = 
      body.product?.name || 
      body.product_name || 
      body.data?.product_name || 
      'Produto Código V';

    // Identificação do Status
    const status = (
      body.status || 
      body.event || 
      body.type || 
      body.data?.status || 
      ''
    ).toLowerCase();

    if (!customerEmail) {
      console.error('Webhook Error: No email found in body');
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
    }

    // LÓGICA DE BLOQUEIO (Reembolso ou Chargeback)
    if (status.includes('refund') || status.includes('reembols') || status.includes('chargeback')) {
      await sql`
        UPDATE users 
        SET is_active = false 
        WHERE email = ${customerEmail}
      `;
      console.log(`User ${customerEmail} blocked due to ${status}`);
      return NextResponse.json({ message: 'User blocked successfully' });
    }

    // LÓGICA DE LIBERAÇÃO (Criação de Usuário e Envio de E-mail)
    // 1. Criar ou Atualizar Usuário no Banco
    await sql`
      INSERT INTO users (name, email, password, is_active, is_admin)
      VALUES (${customerName}, ${customerEmail}, '123456', true, false)
      ON CONFLICT (email) 
      DO UPDATE SET is_active = true, name = ${customerName}
    `;

    // 2. Enviar E-mail via Resend
    const { data, error } = await resend.emails.send({
      from: 'Código V <suporte@alphametodo.com>',
      to: [customerEmail],
      subject: 'Seu acesso ao Código V - Acesso Vitalício chegou!',
      html: `
        <div style="background-color: #121212; color: #ffffff; font-family: sans-serif; padding: 40px; max-width: 600px; margin: auto; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 28px; margin-bottom: 10px;">Olá, ${customerName}</h1>
            <p style="font-size: 18px; line-height: 1.6;">🎉 ¡Felicitaciones por tu compra, acabas de dar el primer paso para descubrir el sucio secreto de las lesbianas, que te convertirá en el 1% de hombres que provoca multiples orgasmo intensos a cualquier mujer, dejándolas rogando por más".</p>
          </div>

          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #ff0000;">
            <p style="margin: 0 0 10px 0;">A continuación encontrarás tus datos de acceso a nuestra área de miembros, donde podrás ver todo el contenido que preparé para ti...</p>
            <p style="font-style: italic; font-size: 14px; color: #cccccc;">PD: Si tienes problemas de acceso, contacta a nuestro soporte técnico para que te ayuden a resolver cualquier situación. Accede a través del siguiente link:</p>
            <a href="mailto:suporte@alphametodo.com" style="color: #ff0000; text-decoration: none; font-weight: bold;">Hablar con Soporte</a>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Inicie sesión <span style="color: #ff0000; font-weight: bold;">automáticamente haciendo clic aquí</span></p>
            <p style="margin-bottom: 10px;">o vaya a <a href="https://membros.alphametodo.com" style="color: #ff0000; text-decoration: none;">https://membros.alphametodo.com</a></p>
            
            <div style="margin-top: 30px;">
              <p style="color: #cccccc; margin-bottom: 5px;">use tu email:</p>
              <p style="color: #ff0000; font-size: 20px; font-weight: bold; margin: 0;">${customerEmail}</p>
            </div>

            <div style="margin-top: 20px;">
              <p style="color: #cccccc; margin-bottom: 5px;">tu contraseña:</p>
              <p style="font-size: 48px; font-weight: bold; margin: 0;">123456</p>
            </div>

            <p style="margin-top: 20px; color: #cccccc;">para entrar ahora.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Webhook processed successfully', data });
  } catch (err: any) {
    console.error('Webhook Runtime Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
