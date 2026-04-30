import { logger } from "@/lib/logger";
// app/api/medicines/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const createMedicineSchema = z.object({
  name: z.string().trim().min(1).optional(),
  names: z.array(z.string().trim().min(1)).min(1).optional(),
  category: z.string().trim().optional(),
  is_auto_created: z.boolean().optional().default(false),
}).refine(
  (data) => data.name !== undefined || data.names !== undefined,
  { message: 'Either "name" or "names" must be provided' }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createMedicineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, names, is_auto_created, category } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authHeader = request.headers.get('Authorization') ?? '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Batch mode: create all unique unmapped names
    if (names?.length) {
      const uniqueNames = Array.from(new Set<string>(names));
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
            .insert({ name, is_discontinued: false, is_auto_created: is_auto_created })
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
      .ilike('name', name!)
      .eq('is_discontinued', false)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ id: existing.id, name: existing.name, created: false });
    }

    const insertData: Record<string, unknown> = { name: name, is_discontinued: false, is_auto_created: is_auto_created };
    if (category) insertData.pack_type = category;

    const { data: created, error: insertError } = await supabase
      .from('medicines')
      .insert(insertData)
      .select('id, name')
      .single();

    if (insertError) {
      logger.error('Medicine insert error:', insertError.message);
      return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
    }

    return NextResponse.json({ id: created.id, name: created.name, created: true }, { status: 201 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Route error:', msg);
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 });
  }
}