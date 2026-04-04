import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_QiZp7kt4SofX@ep-hidden-darkness-amasn9pw-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function addSettings() {
  // Create site_settings table
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Insert default banner
  await sql`
    INSERT INTO site_settings (key, value) VALUES
    ('banner_url', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663514395106/RNwrdS82oyF4Jnnd33FcWg/banner-codigov_08f049f6.webp'),
    ('logo_url', 'https://d2xsxph8kpxj0f.cloudfront.net/310519663514395106/RNwrdS82oyF4Jnnd33FcWg/logo_9ceef770.png'),
    ('site_title', 'Código V')
    ON CONFLICT (key) DO NOTHING
  `;

  console.log('✅ site_settings table created and seeded!');
}

addSettings().catch(console.error);
