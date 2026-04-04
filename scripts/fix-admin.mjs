import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import bcrypt from 'bcryptjs';

// Load env
const envContent = readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) envVars[key.trim()] = vals.join('=').trim();
});

const sql = neon(envVars.DATABASE_URL);

async function main() {
  console.log('🔧 Verificando e corrigindo admin...');
  
  // Check current users
  const users = await sql`SELECT id, email, is_admin, password FROM users`;
  console.log('Usuários encontrados:', users.length);
  users.forEach(u => console.log(`  - ${u.email} (admin: ${u.is_admin}), hash: ${u.password?.substring(0, 20)}...`));
  
  // Generate bcrypt hash for 123456
  const bcryptHash = await bcrypt.hash('123456', 10);
  console.log('\nNovo hash bcrypt:', bcryptHash.substring(0, 20) + '...');
  
  const adminEmail = 'moisesmikfc@gmail.com';
  const existing = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;
  
  if (existing.length === 0) {
    console.log('\n⚠️  Admin não encontrado, criando...');
    await sql`
      INSERT INTO users (email, password, name, is_admin, is_active)
      VALUES (${adminEmail}, ${bcryptHash}, 'Admin', true, true)
    `;
    console.log('✅ Admin criado!');
  } else {
    console.log('\n✅ Admin encontrado, atualizando senha com bcrypt...');
    await sql`
      UPDATE users 
      SET password = ${bcryptHash}, is_admin = true, is_active = true
      WHERE email = ${adminEmail}
    `;
    console.log('✅ Senha atualizada com bcrypt!');
  }
  
  // Verify
  const admin = await sql`SELECT id, email, is_admin, is_active, password FROM users WHERE email = ${adminEmail}`;
  console.log('\nAdmin final:');
  console.log(`  Email: ${admin[0].email}`);
  console.log(`  Admin: ${admin[0].is_admin}`);
  console.log(`  Ativo: ${admin[0].is_active}`);
  console.log(`  Hash válido: ${admin[0].password?.startsWith('$2')}`);
  
  // Test password
  const isValid = await bcrypt.compare('123456', admin[0].password);
  console.log(`  Senha 123456 válida: ${isValid}`);
}

main().catch(console.error);
