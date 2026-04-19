import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const users = await sql`
    SELECT id, name, email, is_admin, is_active, status, created_at,
      (SELECT COUNT(*) FROM progress p WHERE p.user_id = users.id AND p.completed = true) as completed_lessons
    FROM users
    ORDER BY
      CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
      created_at DESC
  `;

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { name, email, password, isAdmin } = await request.json();

  const hashedPassword = await bcrypt.hash(password || '123456', 10);

  try {
    const user = await sql`
      INSERT INTO users (name, email, password, is_admin, is_active, status)
      VALUES (${name}, ${email.toLowerCase().trim()}, ${hashedPassword}, ${isAdmin || false}, true, 'approved')
      RETURNING id, name, email, is_admin, is_active, status, created_at
    `;
    return NextResponse.json(user[0]);
  } catch {
    return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
  }
}
