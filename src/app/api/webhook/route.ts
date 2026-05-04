import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Mapeamento de campos comuns em plataformas como Kiwify/Stripe/Hotmart
    const customerEmail = body.customer?.email || body.email || body.data?.object?.customer_email;
    const customerName = body.customer?.name || body.name || body.data?.object?.customer_name || 'Cliente';
    const productName = body.product?.name || body.product_name || 'Produto Código V';

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
    }

    // 1. Criar ou atualizar o usuário no banco de dados (Neon/PostgreSQL)
    // Definimos is_active como true para automação total e senha fixa 123456
    await sql`
      INSERT INTO users (name, email, password, is_active, is_admin)
      VALUES (${customerName}, ${customerEmail}, '123456', true, false)
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        is_active = true
    `;

    // 2. Enviar e-mail de boas-vindas via Resend
    const { data, error } = await resend.emails.send({
      from: 'Suporte <suporte@alphametodo.com>',
      to: [customerEmail],
      subject: `Seu acesso ao ${productName} chegou!`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>Boas-vindas ao ${productName}!</h2>
          <p>Olá <strong>${customerName}</strong>,</p>
          <p>Sua compra foi aprovada e seu acesso já está liberado!</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Link de Acesso:</strong> <a href="https://membros.alphametodo.com">membros.alphametodo.com</a></p>
            <p style="margin: 5px 0 0 0;"><strong>Seu Login:</strong> ${customerEmail}</p>
            <p style="margin: 5px 0 0 0;"><strong>Sua Senha:</strong> 123456</p>
          </div>
          <p>Recomendamos que você salve este e-mail para consultas futuras.</p>
          <p>Se precisar de qualquer ajuda, responda a este e-mail ou entre em contato com nosso suporte.</p>
          <br />
          <p>Atenciosamente,<br /><strong>Equipe Código V</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: 'User created and email sent', data });
  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
