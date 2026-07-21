import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { habitToRow, rowToHabit } from '@/lib/habits-db';
import type { Habit } from '@/types/habit';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const habits = (data ?? []).map(rowToHabit);
    return NextResponse.json(habits);
  } catch (err) {
    console.error('Failed to load habits:', err);
    return NextResponse.json({ error: 'Failed to load habits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  let habit: Habit;
  try {
    habit = (await request.json()) as Habit;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!habit?.id || !habit?.name || !habit?.category) {
    return NextResponse.json({ error: 'Missing required habit fields' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('habits').insert(habitToRow(habit, userId));

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(habit, { status: 201 });
  } catch (err) {
    console.error('Failed to save habit:', err);
    return NextResponse.json({ error: 'Failed to save habit' }, { status: 500 });
  }
}
