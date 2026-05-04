import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const customerEmail = body.customer?.email || body.email || body.data?.object?.customer_email;
    const customerName = body.customer?.name || body.name || body.data?.object?.customer_name || 'Cliente';
    const productName = body.product?.name || body.product_name || 'Produto Código V';

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
    }

    await sql`
      INSERT INTO users (name, email, password, is_active, is_admin)
      VALUES (${customerName}, ${customerEmail}, '123456', true, false)
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        is_active = true
    `;

    const { data, error } = await resend.emails.send({
      from: 'Suporte <suporte@alphametodo.com>',
      to: [customerEmail],
      subject: `Seu acesso ao ${productName} chegou!`,
      html: `
        <div style="background-color: #121212; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; max-width: 600px; margin: auto; border-radius: 10px;">
          <div style="margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Código V</h1>
          </div>
          
          <h2 style="font-size: 24px; margin-bottom: 20px;">Olá, ${customerName}</h2>
          
          <p style="font-size: 16px; line-height: 1.5; color: #cccccc; margin-bottom: 25px;">
            🎉 Parabéns pela sua compra! Você acaba de dar o primeiro passo para descobrir o segredo que vai transformar seus resultados.
          </p>
          
          <p style="font-size: 16px; color: #cccccc; margin-bottom: 25px;">
            Abaixo você encontrará seus dados de acesso à nossa área de membros, onde poderá ver todo o conteúdo que preparei para você...
          </p>
          
          <div style="background-color: #1e1e1e; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #333;">
            <p style="margin: 0 0 15px 0; font-size: 18px;">Inicie sessão automaticamente clicando abaixo:</p>
            <a href="https://membros.alphametodo.com" style="color: #ff3333; font-size: 20px; font-weight: bold; text-decoration: none; display: block; margin-bottom: 20px;">membros.alphametodo.com</a>
            
            <p style="margin: 20px 0 5px 0; color: #888; font-size: 14px;">use seu e-mail:</p>
            <p style="margin: 0 0 20px 0; color: #ff3333; font-size: 18px; font-weight: bold;">${customerEmail}</p>
            
            <p style="margin: 0 0 5px 0; color: #888; font-size: 14px;">sua senha:</p>
            <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">123456</p>
          </div>
          
          <p style="font-size: 14px; color: #666; font-style: italic; margin-bottom: 30px;">
            PS: Se tiver problemas de acesso, entre em contato com nosso suporte técnico para que possamos te ajudar.
            <br />
            <a href="mailto:suporte@alphametodo.com" style="color: #ff3333; text-decoration: none; font-weight: bold;">Falar com Suporte</a>
          </p>
          
          <p style="font-size: 16px; font-weight: bold; color: #ffffff;">Atenciosamente,<br />Equipe Código V</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: 'User created and email sent', data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
