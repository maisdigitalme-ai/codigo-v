import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { setSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuário existente
    let users = await sql`
      SELECT id, name, email, password, is_admin, is_active
      FROM users
      WHERE email = ${normalizedEmail}
    `;

    // Se não existe, criar automaticamente (curso aberto)
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const nameFromEmail = normalizedEmail.split('@')[0];

      users = await sql`
        INSERT INTO users (name, email, password, is_admin, is_active)
        VALUES (${nameFromEmail}, ${normalizedEmail}, ${hashedPassword}, false, true)
        RETURNING id, name, email, password, is_admin, is_active
      `;
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json({ error: 'Tu cuenta está desactivada. Contacta al soporte.' }, { status: 403 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    await setSession({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin,
    });

    return NextResponse.json({ success: true, isAdmin: user.is_admin });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
