import { NextResponse } from 'next/server';
import { setupDatabase } from '@/lib/db-setup';

export async function GET() {
  try {
    await setupDatabase();
    return NextResponse.json({ success: true, message: 'Base de datos configurada correctamente' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
