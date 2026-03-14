import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isControlAuthorized } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// GET — 인시던트 목록 조회
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('mc_incidents')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('Could not find')) {
        return NextResponse.json({ items: [], tableReady: false });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ items: data ?? [], tableReady: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    );
  }
}

// POST — 인시던트 생성
export async function POST(request: NextRequest) {
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, severity, services_affected } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'title required' }, { status: 400 });
    }
    if (!severity || !['critical', 'high', 'medium', 'low'].includes(severity)) {
      return NextResponse.json({ error: 'valid severity required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('mc_incidents')
      .insert({
        title: title.trim(),
        description: description || '',
        severity,
        status: 'open',
        services_affected: services_affected || [],
        detected_at: new Date().toISOString(),
        source: 'manual',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    );
  }
}

// PATCH — 인시던트 상태 업데이트
export async function PATCH(request: NextRequest) {
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (updates.status === 'resolved') {
      payload.resolved_at = new Date().toISOString();
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('mc_incidents')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ item: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    );
  }
}

// DELETE — 인시던트 삭제
export async function DELETE(request: NextRequest) {
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('mc_incidents').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown error' },
      { status: 500 }
    );
  }
}
