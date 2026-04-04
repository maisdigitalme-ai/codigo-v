import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

// Load env
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) envVars[key.trim()] = vals.join('=').trim();
});

const sql = neon(envVars.DATABASE_URL);

function hashPassword(password) {
  return createHash('sha256').update(password + 'codigov_salt_2024').digest('hex');
}

async function main() {
  console.log('🔍 Verificando usuários...');
  
  const users = await sql`SELECT id, email, is_admin, password_hash FROM users`;
  console.log('Usuários encontrados:', users.length);
  console.log(JSON.stringify(users, null, 2));
  
  // Test password hash
  const testHash = hashPassword('123456');
  console.log('\nHash esperado para 123456:', testHash);
  
  if (users.length > 0) {
    console.log('\nHash no banco:', users[0].password_hash);
    console.log('Match:', users[0].password_hash === testHash);
  }
  
  // Fix admin user if needed
  const adminEmail = 'moisesmikfc@gmail.com';
  const existing = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;
  
  if (existing.length === 0) {
    console.log('\n⚠️  Admin não encontrado, criando...');
    await sql`
      INSERT INTO users (email, password_hash, name, is_admin)
      VALUES (${adminEmail}, ${testHash}, 'Admin', true)
    `;
    console.log('✅ Admin criado!');
  } else {
    console.log('\n✅ Admin já existe, atualizando senha...');
    await sql`
      UPDATE users SET password_hash = ${testHash}, is_admin = true
      WHERE email = ${adminEmail}
    `;
    console.log('✅ Senha atualizada!');
  }
  
  // Verify
  const admin = await sql`SELECT id, email, is_admin FROM users WHERE email = ${adminEmail}`;
  console.log('\nAdmin final:', admin[0]);
}

main().catch(console.error);
