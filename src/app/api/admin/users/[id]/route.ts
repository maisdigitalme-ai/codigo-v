import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const body = await request.json();
  const { name, email, password, isActive, isAdmin, status } = body;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`
      UPDATE users SET
        name = COALESCE(${name}, name),
        email = COALESCE(${email?.toLowerCase().trim()}, email),
        password = ${hashedPassword},
        is_active = COALESCE(${isActive}, is_active),
        is_admin = COALESCE(${isAdmin}, is_admin),
        status = COALESCE(${status}, status)
      WHERE id = ${params.id}
    `;
  } else {
    await sql`
      UPDATE users SET
        name = COALESCE(${name}, name),
        email = COALESCE(${email?.toLowerCase().trim()}, email),
        is_active = COALESCE(${isActive}, is_active),
        is_admin = COALESCE(${isAdmin}, is_admin),
        status = COALESCE(${status}, status)
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
