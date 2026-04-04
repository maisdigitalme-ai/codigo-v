import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_QiZp7kt4SofX@ep-hidden-darkness-amasn9pw-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';
const ADMIN_EMAIL = 'moisesmikfc@gmail.com';

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function setup() {
  console.log('🔧 Configurando banco de dados...');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      thumbnail_url TEXT DEFAULT '',
      position INTEGER DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      description TEXT DEFAULT '',
      video_embed TEXT DEFAULT '',
      duration VARCHAR(50) DEFAULT '',
      position INTEGER DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      is_free BOOLEAN DEFAULT FALSE,
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

  console.log('✅ Tabelas criadas!');

  // Seed módulos
  const existingModules = await sql`SELECT COUNT(*) as count FROM modules`;
  if (parseInt(existingModules[0].count) === 0) {
    console.log('🌱 Inserindo módulos e aulas...');

    await sql`
      INSERT INTO modules (title, description, position, thumbnail_url) VALUES
      ('Módulo #1: La Redención', 'Descubre los fundamentos del placer femenino y cómo crear conexiones profundas con tu pareja.', 1, ''),
      ('Módulo #2: Apolo 13', 'Técnicas avanzadas para llevar a tu pareja a nuevos niveles de placer y satisfacción.', 2, ''),
      ('Módulo #3: El Poder de la Penetración', 'Domina el arte de la penetración y aprende a maximizar el placer de ambos.', 3, ''),
      ('Módulo #4: Acelerador de Resultados', 'Estrategias para acelerar tu aprendizaje y aplicar todo lo que has aprendido.', 4, ''),
      ('Módulo #5: Secretos Sexuales que Todo Hombre Debe Saber', 'Los secretos mejor guardados sobre la sexualidad femenina revelados.', 5, ''),
      ('Módulo #6: Sexflix', 'Contenido exclusivo y avanzado para llevar tu vida sexual al siguiente nivel.', 6, '')
    `;

    const mod1 = await sql`SELECT id FROM modules WHERE position = 1`;
    await sql`INSERT INTO lessons (module_id, title, position, is_free) VALUES
      (${mod1[0].id}, 'Introducción', 1, true),
      (${mod1[0].id}, 'Preparación del ambiente + Playlist Sexuales', 2, false),
      (${mod1[0].id}, 'Cómo Encontrar el Punto G, A, U y Cervix', 3, false),
      (${mod1[0].id}, 'Cómo encontrar el punto mágico', 4, false),
      (${mod1[0].id}, 'Cómo Encontrar el Punto U', 5, false),
      (${mod1[0].id}, 'La Técnica de Aquiles', 6, false),
      (${mod1[0].id}, 'Dominando el Placer', 7, false)`;

    const mod2 = await sql`SELECT id FROM modules WHERE position = 2`;
    await sql`INSERT INTO lessons (module_id, title, position) VALUES
      (${mod2[0].id}, 'Introducción al Módulo Apolo 13', 1),
      (${mod2[0].id}, 'La Luna es Mía - Técnicas Orales', 2),
      (${mod2[0].id}, 'Posiciones Avanzadas', 3),
      (${mod2[0].id}, 'El Arte del Toque', 4),
      (${mod2[0].id}, 'Comunicación y Confianza', 5),
      (${mod2[0].id}, 'Práctica y Perfección', 6)`;

    const mod3 = await sql`SELECT id FROM modules WHERE position = 3`;
    await sql`INSERT INTO lessons (module_id, title, position) VALUES
      (${mod3[0].id}, 'Introducción al Poder', 1),
      (${mod3[0].id}, 'Anatomía del Placer', 2),
      (${mod3[0].id}, 'Ritmo y Control', 3),
      (${mod3[0].id}, 'Técnicas de Penetración Profunda', 4),
      (${mod3[0].id}, 'El Orgasmo Femenino', 5),
      (${mod3[0].id}, 'Múltiples Orgasmos', 6),
      (${mod3[0].id}, 'Masterclass Final', 7)`;

    const mod4 = await sql`SELECT id FROM modules WHERE position = 4`;
    await sql`INSERT INTO lessons (module_id, title, position) VALUES
      (${mod4[0].id}, 'Mentalidad de Campeón', 1),
      (${mod4[0].id}, 'Rutina Diaria de Práctica', 2),
      (${mod4[0].id}, 'Superando Bloqueos', 3),
      (${mod4[0].id}, 'Acelerando Resultados', 4),
      (${mod4[0].id}, 'Casos de Éxito', 5)`;

    const mod5 = await sql`SELECT id FROM modules WHERE position = 5`;
    await sql`INSERT INTO lessons (module_id, title, position) VALUES
      (${mod5[0].id}, 'Los Secretos Revelados', 1),
      (${mod5[0].id}, 'Psicología Femenina del Placer', 2),
      (${mod5[0].id}, 'Fantasías y Deseos', 3),
      (${mod5[0].id}, 'Conexión Emocional y Sexual', 4),
      (${mod5[0].id}, 'El Lenguaje del Cuerpo', 5),
      (${mod5[0].id}, 'Secretos Finales', 6)`;

    const mod6 = await sql`SELECT id FROM modules WHERE position = 6`;
    await sql`INSERT INTO lessons (module_id, title, position) VALUES
      (${mod6[0].id}, 'Sexo entre Parejas', 1),
      (${mod6[0].id}, 'Tríos y Fantasías Avanzadas', 2),
      (${mod6[0].id}, 'Yoga Sexual', 3),
      (${mod6[0].id}, 'Secretos Sexuales Avanzados', 4),
      (${mod6[0].id}, 'Contenido Exclusivo Premium', 5)`;

    console.log('✅ Módulos e aulas inseridos!');
  } else {
    console.log('ℹ️  Módulos já existem, pulando seed.');
  }

  // Admin user
  const existingAdmin = await sql`SELECT id FROM users WHERE email = ${ADMIN_EMAIL}`;
  if (existingAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await sql`
      INSERT INTO users (name, email, password, is_admin)
      VALUES ('Administrador', ${ADMIN_EMAIL}, ${hashedPassword}, true)
    `;
    console.log('✅ Usuário admin criado:', ADMIN_EMAIL);
  } else {
    console.log('ℹ️  Admin já existe.');
  }

  await sql.end();
  console.log('🎉 Setup completo!');
}

setup().catch(e => { console.error('❌ Erro:', e); process.exit(1); });
