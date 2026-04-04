import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const courses = await sql`
    SELECT c.*, 
      COUNT(DISTINCT m.id) as module_count
    FROM courses c
    LEFT JOIN modules m ON m.course_id = c.id
    GROUP BY c.id
    ORDER BY c.position
  `;

  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { title, description, thumbnailUrl, contentType, slug } = await request.json();
  const maxPos = await sql`SELECT COALESCE(MAX(position), 0) as max FROM courses`;
  const position = parseInt(maxPos[0].max) + 1;

  // Generate slug from title if not provided
  const courseSlug = slug || title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newCourse = await sql`
    INSERT INTO courses (title, description, thumbnail_url, position, slug, content_type)
    VALUES (${title}, ${description || ''}, ${thumbnailUrl || ''}, ${position}, ${courseSlug}, ${contentType || 'video'})
    RETURNING *
  `;

  return NextResponse.json(newCourse[0]);
}
