import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const body = await request.json();
  const { name, email, password, isActive, isAdmin, status, action } = body;

  // Ação direta de aprovação — sem COALESCE, UPDATE direto
  if (action === 'approve') {
    await sql`UPDATE users SET is_active = true, status = 'approved' WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  }

  // Ação direta de desativação
  if (action === 'deactivate') {
    await sql`UPDATE users SET is_active = false WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  }

  // Ação direta de ativação
  if (action === 'activate') {
    await sql`UPDATE users SET is_active = true WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  }

  // Edição geral
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`
      UPDATE users SET
        name = COALESCE(${name ?? null}, name),
        email = COALESCE(${email ? email.toLowerCase().trim() : null}, email),
        password = ${hashedPassword},
        is_active = COALESCE(${isActive ?? null}, is_active),
        is_admin = COALESCE(${isAdmin ?? null}, is_admin),
        status = COALESCE(${status ?? null}, status)
      WHERE id = ${params.id}
    `;
  } else {
    await sql`
      UPDATE users SET
        name = COALESCE(${name ?? null}, name),
        email = COALESCE(${email ? email.toLowerCase().trim() : null}, email),
        is_active = COALESCE(${isActive ?? null}, is_active),
        is_admin = COALESCE(${isAdmin ?? null}, is_admin),
        status = COALESCE(${status ?? null}, status)
      WHERE id = ${params.id}
    `;
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  await sql`DELETE FROM users WHERE id = ${params.id}`;
  return NextResponse.json({ success: true });
}
