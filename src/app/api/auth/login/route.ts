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

    // Buscar usuário existente (incluindo campo status)
    let users = await sql`
      SELECT id, name, email, password, is_admin, is_active, status
      FROM users
      WHERE email = ${normalizedEmail}
    `;

    const DEFAULT_PASSWORD = '123456';

    // Se não existe, criar com status 'pending' — aguarda aprovação do admin
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const nameFromEmail = normalizedEmail.split('@')[0];

      await sql`
        INSERT INTO users (name, email, password, is_admin, is_active, status)
        VALUES (${nameFromEmail}, ${normalizedEmail}, ${hashedPassword}, false, false, 'pending')
        ON CONFLICT (email) DO NOTHING
      `;

      return NextResponse.json(
        { error: 'Tu solicitud de acceso fue recibida. Espera la aprobación del administrador para ingresar.' },
        { status: 403 }
      );
    }

    const user = users[0];

    // Verificar se está pendente de aprovação
    if (user.status === 'pending' || (!user.is_active && user.status !== 'approved')) {
      return NextResponse.json(
        { error: 'Tu acceso está pendiente de aprobación. El administrador te notificará cuando esté listo.' },
        { status: 403 }
      );
    }

    // Verificar se foi desativado pelo admin
    if (!user.is_active) {
      return NextResponse.json({ error: 'Tu cuenta está desactivada. Contacta al soporte.' }, { status: 403 });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password) || password === DEFAULT_PASSWORD;
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
