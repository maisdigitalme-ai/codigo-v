export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import sql from '@/lib/db';
import ModuleClient from '@/components/ModuleClient';
import ImmersivePdfModule from '@/components/ImmersivePdfModule';
import ImmersiveSecretosModule from '@/components/ImmersiveSecretosModule';

export default async function ModulePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const modules = await sql`SELECT * FROM modules WHERE id = ${params.id} AND is_published = true`;
  if (!modules.length) notFound();

  const moduleData = modules[0];

  // Drip content check for the module itself
  if (!session.isAdmin && moduleData.drip_enabled && moduleData.drip_days > 0) {
    const userRow = await sql`SELECT enrolled_at FROM users WHERE id = ${session.id}`;
    const enrolledAt = userRow[0]?.enrolled_at ? new Date(userRow[0].enrolled_at) : new Date();
    const daysSinceEnrollment = Math.floor((Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceEnrollment < moduleData.drip_days) {
      redirect('/dashboard');
    }
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
  let enrolledAtForLessons: Date | null = null;
  const lessonsWithDrip = lessons.map((l: any) => {
    if (!session.isAdmin && l.drip_enabled && l.drip_days > 0) {
      if (!enrolledAtForLessons) {
        // Lazy load - only fetch if needed
        enrolledAtForLessons = new Date(); // will be overwritten below
      }
      return { ...l, _needs_drip_check: true };
    }
    return { ...l, is_locked: false, days_remaining: 0 };
  });

  // If any lesson needs drip check, fetch enrolled_at
  const needsDripCheck = lessonsWithDrip.some((l: any) => l._needs_drip_check);
  let daysSinceEnrollmentForLessons = Infinity;
  if (needsDripCheck) {
    const userRow2 = await sql`SELECT enrolled_at FROM users WHERE id = ${session.id}`;
    const ea = userRow2[0]?.enrolled_at ? new Date(userRow2[0].enrolled_at) : new Date();
    daysSinceEnrollmentForLessons = Math.floor((Date.now() - ea.getTime()) / (1000 * 60 * 60 * 24));
  }

  const finalLessons = lessonsWithDrip.map((l: any) => {
    if (l._needs_drip_check) {
      const isLocked = daysSinceEnrollmentForLessons < l.drip_days;
      const daysRemaining = isLocked ? l.drip_days - daysSinceEnrollmentForLessons : 0;
      const { _needs_drip_check, ...rest } = l;
      return { ...rest, is_locked: isLocked, days_remaining: daysRemaining };
    }
    const { _needs_drip_check, ...rest } = l;
    return rest;
  });

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
