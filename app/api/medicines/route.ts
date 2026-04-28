// app/api/medicines/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const singleName = typeof body.name === 'string' ? body.name.trim() : null;
    const batchNames = Array.isArray(body.names) ? body.names.map((n: unknown) => String(n).trim()).filter(Boolean) : [];

    if (!singleName && batchNames.length === 0) {
      return NextResponse.json({ error: 'Medicine name(s) required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authHeader = request.headers.get('Authorization') ?? '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: authHeader ? { headers: { Authorization: `Bearer ${authHeader}` } } : undefined,
    });

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Batch mode: create all unique unmapped names
    if (batchNames.length > 0) {
      const uniqueNames = [...new Set(batchNames)];
      const results: { name: string; id: number }[] = [];

      for (const name of uniqueNames) {
        const { data: existing } = await supabase
          .from('medicines')
          .select('id, name')
          .ilike('name', name)
          .eq('is_discontinued', false)
          .limit(1)
          .maybeSingle();

        if (existing) {
          results.push({ name: existing.name, id: existing.id });
        } else {
          const { data: created, error: insertError } = await supabase
            .from('medicines')
            .insert({ name, is_discontinued: false })
            .select('id, name')
            .single();

          if (!insertError && created) {
            results.push({ name: created.name, id: created.id });
          }
        }
      }

      return NextResponse.json(results);
    }

    // Single mode: upsert one medicine
    const { data: existing } = await supabase
      .from('medicines')
      .select('id, name')
      .ilike('name', singleName!)
      .eq('is_discontinued', false)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ id: existing.id, name: existing.name, created: false });
    }

    const insertData: Record<string, unknown> = { name: singleName, is_discontinued: false };
    if (body.category) insertData.pack_type = body.category;

    const { data: created, error: insertError } = await supabase
      .from('medicines')
      .insert(insertData)
      .select('id, name')
      .single();

    if (insertError) {
      console.error('Medicine insert error:', insertError.message);
      return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
    }

    return NextResponse.json({ id: created.id, name: created.name, created: true }, { status: 201 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Route error:', msg);
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 });
  }
}