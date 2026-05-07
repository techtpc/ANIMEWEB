import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local manually
const envContent = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'adminAnime@localhost.com',
    password: 'admin123',
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating user:', error.message);
    return;
  }

  console.log('✅ Admin user created successfully!');
  console.log('Email: adminAnime@localhost.com');
  console.log('Password: admin123');
  console.log('User ID:', data.user.id);
}

createAdminUser();
