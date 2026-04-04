export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import sql from '@/lib/db';
import ModuleClient from '@/components/ModuleClient';

export default async function ModulePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const modules = await sql`SELECT * FROM modules WHERE id = ${params.id} AND is_published = true`;
  if (!modules.length) notFound();

  const moduleData = modules[0];

  const lessons = await sql`
    SELECT l.*,
      CASE WHEN p.completed = true THEN true ELSE false END as completed
    FROM lessons l
    LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ${session.id}
    WHERE l.module_id = ${params.id} AND l.is_published = true
    ORDER BY l.position
  `;

  // First lesson to auto-select
  const firstLesson = lessons[0] || null;

  return (
    <ModuleClient
      module={JSON.parse(JSON.stringify(moduleData))}
      lessons={JSON.parse(JSON.stringify(lessons))}
      initialLesson={firstLesson ? JSON.parse(JSON.stringify(firstLesson)) : null}
      user={{ name: session.name, email: session.email, isAdmin: session.isAdmin }}
    />
  );
}
