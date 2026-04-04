import sql from './db';

export async function setupDatabase() {
  // Criar tabelas
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL DEFAULT '123456',
      is_admin BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      thumbnail_url TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      course_group VARCHAR(100) DEFAULT 'codigo-v',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Add course_group column if it doesn't exist (migration for existing DBs)
  await sql`
    DO $$ BEGIN
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS course_group VARCHAR(100) DEFAULT 'codigo-v';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      video_embed TEXT,
      thumbnail_url TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      is_free BOOLEAN DEFAULT FALSE,
      duration VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      UNIQUE(user_id, lesson_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Seed: Módulos do Código V
  const existingModules = await sql`SELECT COUNT(*) as count FROM modules`;
  if (parseInt(existingModules[0].count) === 0) {
    await sql`
      INSERT INTO modules (title, description, position, thumbnail_url) VALUES
      ('Módulo #1: La Redención', 'Descubre los fundamentos del placer femenino y cómo crear conexiones profundas con tu pareja.', 1, ''),
      ('Módulo #2: Apolo 13', 'Técnicas avanzadas para llevar a tu pareja a nuevos niveles de placer y satisfacción.', 2, ''),
      ('Módulo #3: El Poder de la Penetración', 'Domina el arte de la penetración y aprende a maximizar el placer de ambos.', 3, ''),
      ('Módulo #4: Acelerador de Resultados', 'Estrategias para acelerar tu aprendizaje y aplicar todo lo que has aprendido.', 4, ''),
      ('Módulo #5: Secretos Sexuales que Todo Hombre Debe Saber', 'Los secretos mejor guardados sobre la sexualidad femenina revelados.', 5, ''),
      ('Módulo #6: Sexflix', 'Contenido exclusivo y avanzado para llevar tu vida sexual al siguiente nivel.', 6, '')
    `;

    // Seed: Aulas do Módulo 1
    const mod1 = await sql`SELECT id FROM modules WHERE position = 1`;
    await sql`
      INSERT INTO lessons (module_id, title, position, is_free) VALUES
      (${mod1[0].id}, 'Introducción', 1, true),
      (${mod1[0].id}, 'Preparación del ambiente + Playlist Sexuales', 2, false),
      (${mod1[0].id}, 'Cómo Encontrar el Punto G, A, U y Cervix', 3, false),
      (${mod1[0].id}, 'Cómo encontrar el punto mágico', 4, false),
      (${mod1[0].id}, 'Cómo Encontrar el Punto U', 5, false),
      (${mod1[0].id}, 'La Técnica de Aquiles', 6, false),
      (${mod1[0].id}, 'Dominando el Placer', 7, false)
    `;

    // Seed: Aulas do Módulo 2
    const mod2 = await sql`SELECT id FROM modules WHERE position = 2`;
    await sql`
      INSERT INTO lessons (module_id, title, position) VALUES
      (${mod2[0].id}, 'Introducción al Módulo Apolo 13', 1),
      (${mod2[0].id}, 'La Luna es Mía - Técnicas Orales', 2),
      (${mod2[0].id}, 'Posiciones Avanzadas', 3),
      (${mod2[0].id}, 'El Arte del Toque', 4),
      (${mod2[0].id}, 'Comunicación y Confianza', 5),
      (${mod2[0].id}, 'Práctica y Perfección', 6)
    `;

    // Seed: Aulas do Módulo 3
    const mod3 = await sql`SELECT id FROM modules WHERE position = 3`;
    await sql`
      INSERT INTO lessons (module_id, title, position) VALUES
      (${mod3[0].id}, 'Introducción al Poder', 1),
      (${mod3[0].id}, 'Anatomía del Placer', 2),
      (${mod3[0].id}, 'Ritmo y Control', 3),
      (${mod3[0].id}, 'Técnicas de Penetración Profunda', 4),
      (${mod3[0].id}, 'El Orgasmo Femenino', 5),
      (${mod3[0].id}, 'Múltiples Orgasmos', 6),
      (${mod3[0].id}, 'Masterclass Final', 7)
    `;

    // Seed: Aulas do Módulo 4
    const mod4 = await sql`SELECT id FROM modules WHERE position = 4`;
    await sql`
      INSERT INTO lessons (module_id, title, position) VALUES
      (${mod4[0].id}, 'Mentalidad de Campeón', 1),
      (${mod4[0].id}, 'Rutina Diaria de Práctica', 2),
      (${mod4[0].id}, 'Superando Bloqueos', 3),
      (${mod4[0].id}, 'Acelerando Resultados', 4),
      (${mod4[0].id}, 'Casos de Éxito', 5)
    `;

    // Seed: Aulas do Módulo 5
    const mod5 = await sql`SELECT id FROM modules WHERE position = 5`;
    await sql`
      INSERT INTO lessons (module_id, title, position) VALUES
      (${mod5[0].id}, 'Los Secretos Revelados', 1),
      (${mod5[0].id}, 'Psicología Femenina del Placer', 2),
      (${mod5[0].id}, 'Fantasías y Deseos', 3),
      (${mod5[0].id}, 'Conexión Emocional y Sexual', 4),
      (${mod5[0].id}, 'El Lenguaje del Cuerpo', 5),
      (${mod5[0].id}, 'Secretos Finales', 6)
    `;

    // Seed: Aulas do Módulo 6
    const mod6 = await sql`SELECT id FROM modules WHERE position = 6`;
    await sql`
      INSERT INTO lessons (module_id, title, position) VALUES
      (${mod6[0].id}, 'Sexo entre Parejas', 1),
      (${mod6[0].id}, 'Tríos y Fantasías Avanzadas', 2),
      (${mod6[0].id}, 'Yoga Sexual', 3),
      (${mod6[0].id}, 'Secretos Sexuales Avanzados', 4),
      (${mod6[0].id}, 'Contenido Exclusivo Premium', 5)
    `;

    // Criar usuário admin padrão
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('123456', 10);
    await sql`
      INSERT INTO users (name, email, password, is_admin) 
      VALUES ('Administrador', ${process.env.ADMIN_EMAIL || 'admin@codigov.com'}, ${hashedPassword}, true)
      ON CONFLICT (email) DO NOTHING
    `;
  }

  // Migration: Set course_group for Secretos Sexuales module
  await sql`
    UPDATE modules SET course_group = 'secretos-sexuales'
    WHERE title ILIKE '%secretos%' AND course_group = 'codigo-v'
  `;

  // Ensure site_settings table exists
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT
    )
  `;

  console.log('✅ Banco de dados configurado com sucesso!');
}
