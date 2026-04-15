import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pymviswgxokdxnmqrmwe.supabase.co';
const supabaseKey = 'sb_publishable_YudREbTZ6MJWRDp8o-fw5g_OCc4y7qm';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  const { data, error } = await supabase.from('videos').select('*').limit(1);
  if (error) {
    console.error('Error connecting:', error);
  } else {
    console.log('Connected, data:', data);
  }
}

testConnection();
