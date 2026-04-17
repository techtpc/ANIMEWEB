import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pymviswgxokdxnmqrmwe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bXZpc3dneHdrZHhubXFybXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5ODAzODAsImV4cCI6MTc2NzUxNjM4MH0.KO7hE-YvzGGW7LdYKKN1mFfSaWOW1rjQaVEQ6d_c61U';

const supabase = createClient(supabaseUrl, supabaseKey);

function normalizeSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function normalizeAllSlugs() {
  try {
    console.log('🔄 Normalizing all anime slugs...\n');

    // Get all anime
    const { data: allAnime, error: fetchError } = await supabase
      .from('anime')
      .select('id, title, slug');

    if (fetchError) {
      console.error('❌ Error fetching anime:', fetchError);
      process.exit(1);
    }

    if (!allAnime || allAnime.length === 0) {
      console.log('No anime found');
      return;
    }

    console.log(`Found ${allAnime.length} anime to check\n`);

    for (const anime of allAnime) {
      const normalizedSlug = normalizeSlug(anime.title);
      
      if (anime.slug !== normalizedSlug) {
        console.log(`🔄 Updating: "${anime.title}"`);
        console.log(`   Old slug: "${anime.slug}"`);
        console.log(`   New slug: "${normalizedSlug}"\n`);

        const { error: updateError } = await supabase
          .from('anime')
          .update({ slug: normalizedSlug })
          .eq('id', anime.id);

        if (updateError) {
          console.error(`   ❌ Error: ${updateError.message}\n`);
        } else {
          console.log('   ✅ Updated\n');
        }
      } else {
        console.log(`✅ Already normalized: "${anime.title}" (${anime.slug})\n`);
      }
    }

    console.log('\n✨ All slugs have been normalized!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

normalizeAllSlugs();
