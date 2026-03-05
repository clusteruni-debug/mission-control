import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isControlAuthorized } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// GET — Agent Queue 태스크 목록
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('mc_agent_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('Could not find') || error.message.includes('does not exist')) {
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

// POST — 태스크 등록
export async function POST(request: NextRequest) {
  if (!isControlAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, project, description, priority, source } = body;

    if (!title?.trim() || !project?.trim()) {
      return NextResponse.json({ error: 'title and project required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('mc_agent_tasks')
      .insert({
        title: title.trim(),
        project: project.trim(),
        description: description || '',
        priority: priority || 2,
        phase: source === 'patrol-bug' || source === 'patrol-roadmap' || source === 'patrol-quality' ? 'proposed' : 'pending',
        source: source || 'manual',
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

// PATCH — 태스크 상태/단계 업데이트
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

    const payload: Record<string, unknown> = { ...updates };
    if (updates.phase === 'done' || updates.phase === 'failed') {
      payload.finished_at = new Date().toISOString();
    }
    if (updates.phase === 'plan' || updates.phase === 'build') {
      payload.started_at = payload.started_at || new Date().toISOString();
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('mc_agent_tasks')
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

// DELETE — 태스크 삭제
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
    const { error } = await supabase.from('mc_agent_tasks').delete().eq('id', id);

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
