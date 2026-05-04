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

    // Mapeamento Coringa para E-mail
    const customerEmail = 
      body.customer?.email || 
      body.email || 
      body.data?.object?.customer_email || 
      body.data?.email ||
      body.payer?.email ||
      body.usr_email ||
      body.client?.email;

    // Mapeamento Coringa para Nome
    const customerName = 
      body.customer?.name || 
      body.name || 
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

    // LÓGICA DE LIBERAÇÃO
    if (status === '' || status.includes('paid') || status.includes('pago') || status.includes('confirm') || status.includes('approved')) {
      
      // 1. Criar ou atualizar o usuário no banco de dados
      await sql`
        INSERT INTO users (name, email, password, is_active, is_admin)
        VALUES (${customerName}, ${customerEmail}, '123456', true, false)
        ON CONFLICT (email) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          is_active = true
      `;

      // 2. Enviar e-mail de boas-vindas
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
            
            <div style="background-color: #1e1e1e; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #333;">
              <p style="margin: 0 0 15px 0; font-size: 18px;">Inicie sessão automaticamente clicando abaixo:</p>
              <a href="https://membros.alphametodo.com" style="color: #ff3333; font-size: 20px; font-weight: bold; text-decoration: none; display: block; margin-bottom: 20px;">membros.alphametodo.com</a>
              
              <p style="margin: 20px 0 5px 0; color: #888; font-size: 14px;">use seu e-mail:</p>
              <p style="margin: 0 0 20px 0; color: #ff3333; font-size: 18px; font-weight: bold;">${customerEmail}</p>
              
              <p style="margin: 0 0 5px 0; color: #888; font-size: 14px;">sua senha:</p>
              <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">123456</p>
            </div>
            
            <p style="font-size: 14px; color: #666; font-style: italic; margin-bottom: 30px;">
              PS: Se tiver problemas de acesso, entre em contato com nosso suporte técnico.
              <br />
              <a href="mailto:suporte@alphametodo.com" style="color: #ff3333; text-decoration: none; font-weight: bold;">Falar com Suporte</a>
            </p>
            
            <p style="font-size: 16px; font-weight: bold; color: #ffffff;">Atenciosamente,<br />Equipe Código V</p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend Error:', error);
        return NextResponse.json({ error }, { status: 400 });
      }

      return NextResponse.json({ message: 'User created and email sent', data });
    }

    return NextResponse.json({ message: 'Webhook received but no action taken' });
  } catch (err) {
    console.error('Webhook Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
