import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a server-side Supabase client using service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedSlug = slug.toLowerCase().trim();

    console.log('📝 [API] Creating genre:', { name: trimmedName, slug: trimmedSlug });

    // Insert using service role (bypasses RLS restrictions)
    const { data, error } = await supabaseAdmin
      .from('genres')
      .insert([
        {
          name: trimmedName,
          slug: trimmedSlug,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Supabase Error:', error);

      // Check for duplicate error (PostgreSQL unique constraint)
      if (error.code === '23505' || error.message.includes('duplicate')) {
        console.warn('⚠️ [API] Duplicate: Genre sudah ada');
        
        // Try to fetch and return existing category
        const { data: existing } = await supabaseAdmin
          .from('genres')
          .select('*')
          .eq('slug', trimmedSlug)
          .single();
        
        if (existing) {
          return NextResponse.json({ data: existing }, { status: 200 });
        }
      }

      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log('✅ [API] Genre created:', data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('❌ [API] Exception:', err);
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
