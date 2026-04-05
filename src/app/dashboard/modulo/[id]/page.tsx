export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import sql from '@/lib/db';
import { checkModuleDripLock } from '@/lib/drip-check';
import ModuleClient from '@/components/ModuleClient';
import ImmersivePdfModule from '@/components/ImmersivePdfModule';
import ImmersiveSecretosModule from '@/components/ImmersiveSecretosModule';

export default async function ModulePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const modules = await sql`SELECT * FROM modules WHERE id = ${params.id} AND is_published = true`;
  if (!modules.length) notFound();

  const moduleData = modules[0];

  // ═══ DRIP CONTENT: REAL ACCESS BLOCKING ═══
  // Checks both course-level and module-level drip locks
  const { locked: moduleLocked } = await checkModuleDripLock(
    session.id,
    parseInt(params.id),
    session.isAdmin
  );

  if (moduleLocked) {
    redirect('/dashboard');
  }

  // Check if this is the "Acelerador de Resultados" or "Sexflix" module
  const isAcelerador = 
    moduleData.title?.toLowerCase().includes('acelerador') ||
    moduleData.title?.toLowerCase().includes('sexflix') ||
    moduleData.position === 6;

  if (isAcelerador) {
    return (
      <ImmersivePdfModule
        user={{ name: session.name, email: session.email, isAdmin: session.isAdmin }}
      />
    );
  }

  // Check if this is the "Secretos Sexuales" module
  const isSecretos =
    moduleData.title?.toLowerCase().includes('secretos') ||
    moduleData.title?.toLowerCase().includes('secretos sexuales');

  if (isSecretos) {
    return (
      <ImmersiveSecretosModule
        user={{ name: session.name, email: session.email, isAdmin: session.isAdmin }}
      />
    );
  }

  const lessons = await sql`
    SELECT l.*,
      CASE WHEN p.completed = true THEN true ELSE false END as completed
    FROM lessons l
    LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ${session.id}
    WHERE l.module_id = ${params.id} AND l.is_published = true
    ORDER BY l.position
  `;

  // Calculate drip lock status for individual lessons
  let finalLessons;
  if (!session.isAdmin) {
    const userRow = await sql`SELECT enrolled_at FROM users WHERE id = ${session.id}`;
    const enrolledAt = userRow[0]?.enrolled_at ? new Date(userRow[0].enrolled_at) : new Date();
    const daysSinceEnrollment = Math.floor((Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));

    finalLessons = lessons.map((l: any) => {
      if (l.drip_enabled && l.drip_days > 0) {
        const isLocked = daysSinceEnrollment < l.drip_days;
        const daysRemaining = isLocked ? l.drip_days - daysSinceEnrollment : 0;
        return { ...l, is_locked: isLocked, days_remaining: daysRemaining };
      }
      return { ...l, is_locked: false, days_remaining: 0 };
    });
  } else {
    finalLessons = lessons.map((l: any) => ({ ...l, is_locked: false, days_remaining: 0 }));
  }

  // First lesson to auto-select (skip locked ones)
  const firstLesson = finalLessons.find((l: any) => !l.is_locked) || finalLessons[0] || null;

  return (
    <ModuleClient
      module={JSON.parse(JSON.stringify(moduleData))}
      lessons={JSON.parse(JSON.stringify(finalLessons))}
      initialLesson={firstLesson ? JSON.parse(JSON.stringify(firstLesson)) : null}
      user={{ name: session.name, email: session.email, isAdmin: session.isAdmin }}
    />
  );
}
