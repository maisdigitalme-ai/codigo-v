import sql from './db';

/**
 * Check if a lesson is locked by drip content rules.
 * Checks 3 levels: Course → Module → Lesson
 * Returns { locked: boolean, daysRemaining: number }
 */
export async function checkLessonDripLock(
  userId: number,
  lessonId: number,
  isAdmin: boolean
): Promise<{ locked: boolean; daysRemaining: number }> {
  if (isAdmin) return { locked: false, daysRemaining: 0 };

  // Get lesson + module + course info in one query
  const rows = await sql`
    SELECT 
      l.drip_enabled as lesson_drip_enabled,
      l.drip_days as lesson_drip_days,
      m.drip_enabled as module_drip_enabled,
      m.drip_days as module_drip_days,
      m.course_id,
      c.drip_enabled as course_drip_enabled,
      c.drip_days as course_drip_days
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    LEFT JOIN courses c ON c.id = m.course_id
    WHERE l.id = ${lessonId}
  `;

  if (!rows.length) return { locked: false, daysRemaining: 0 };

  const row = rows[0];

  // Get user enrollment date
  const userRow = await sql`SELECT enrolled_at FROM users WHERE id = ${userId}`;
  const enrolledAt = userRow[0]?.enrolled_at ? new Date(userRow[0].enrolled_at) : new Date();
  const daysSinceEnrollment = Math.floor((Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));

  // Check course-level lock
  if (row.course_drip_enabled && row.course_drip_days > 0 && daysSinceEnrollment < row.course_drip_days) {
    return { locked: true, daysRemaining: row.course_drip_days - daysSinceEnrollment };
  }

  // Check module-level lock
  if (row.module_drip_enabled && row.module_drip_days > 0 && daysSinceEnrollment < row.module_drip_days) {
    return { locked: true, daysRemaining: row.module_drip_days - daysSinceEnrollment };
  }

  // Check lesson-level lock
  if (row.lesson_drip_enabled && row.lesson_drip_days > 0 && daysSinceEnrollment < row.lesson_drip_days) {
    return { locked: true, daysRemaining: row.lesson_drip_days - daysSinceEnrollment };
  }

  return { locked: false, daysRemaining: 0 };
}

/**
 * Check if a module is locked by drip content rules.
 * Checks 2 levels: Course → Module
 * Returns { locked: boolean, daysRemaining: number }
 */
export async function checkModuleDripLock(
  userId: number,
  moduleId: number,
  isAdmin: boolean
): Promise<{ locked: boolean; daysRemaining: number }> {
  if (isAdmin) return { locked: false, daysRemaining: 0 };

  // Get module + course info
  const rows = await sql`
    SELECT 
      m.drip_enabled as module_drip_enabled,
      m.drip_days as module_drip_days,
      m.course_id,
      c.drip_enabled as course_drip_enabled,
      c.drip_days as course_drip_days
    FROM modules m
    LEFT JOIN courses c ON c.id = m.course_id
    WHERE m.id = ${moduleId}
  `;

  if (!rows.length) return { locked: false, daysRemaining: 0 };

  const row = rows[0];

  // Get user enrollment date
  const userRow = await sql`SELECT enrolled_at FROM users WHERE id = ${userId}`;
  const enrolledAt = userRow[0]?.enrolled_at ? new Date(userRow[0].enrolled_at) : new Date();
  const daysSinceEnrollment = Math.floor((Date.now() - enrolledAt.getTime()) / (1000 * 60 * 60 * 24));

  // Check course-level lock
  if (row.course_drip_enabled && row.course_drip_days > 0 && daysSinceEnrollment < row.course_drip_days) {
    return { locked: true, daysRemaining: row.course_drip_days - daysSinceEnrollment };
  }

  // Check module-level lock
  if (row.module_drip_enabled && row.module_drip_days > 0 && daysSinceEnrollment < row.module_drip_days) {
    return { locked: true, daysRemaining: row.module_drip_days - daysSinceEnrollment };
  }

  return { locked: false, daysRemaining: 0 };
}
