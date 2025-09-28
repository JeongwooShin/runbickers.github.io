import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ALLOWED_ORIGINS = (Deno.env.get('CORS_ALLOWED_ORIGINS') ||
  'https://jeongwooshin.github.io,https://btcmobick.runbickers.com')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null) {
  const h: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req.headers.get('origin')) },
  });
}

function html(req: Request, status: number, body: string) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders(req.headers.get('origin')) },
  });
}

async function handleConfirm(token: string, req: Request) {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1) 토큰 조회
  const { data: tok, error: selErr } = await admin
    .from('account_deletion_tokens')
    .select('user_id, used, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (selErr) {
    console.error('Select token error:', selErr);
    return json(req, 500, { error: '토큰 조회에 실패했습니다.' });
  }
  if (!tok) return json(req, 400, { error: '유효하지 않은 토큰입니다.' });
  if (tok.used) return json(req, 400, { error: '이미 사용된 토큰입니다.' });
  if (tok.expires_at && new Date(tok.expires_at).getTime() < Date.now()) {
    return json(req, 400, { error: '만료된 토큰입니다.' });
  }

  // 2) 토큰 사용 처리(먼저 마킹)
  const { error: updErr } = await admin
    .from('account_deletion_tokens')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('token', token)
    .eq('used', false); // 동시성 가드

  if (updErr) {
    console.error('Mark token used error:', updErr);
    return json(req, 500, { error: '토큰 사용 처리에 실패했습니다.' });
  }

  // 3) 사용자 삭제
  try {
    const { error: delErr } = await admin.auth.admin.deleteUser(tok.user_id);
    if (delErr) {
      console.error('Delete user error:', delErr);
      // 실패 시 토큰 되돌릴 수도 있으나, 보안상 재사용 허용하지 않음(원하면 아래 두 줄로 롤백 가능)
      // await admin.from('account_deletion_tokens').update({ used: false, used_at: null }).eq('token', token);
      return json(req, 500, { error: '사용자 삭제에 실패했습니다.' });
    }
  } catch (e) {
    console.error('Delete user threw:', e);
    return json(req, 500, { error: '사용자 삭제 중 오류가 발생했습니다.' });
  }

  return json(req, 200, { ok: true });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req.headers.get('origin')) });

  try {
    if (req.method === 'POST') {
      const { token } = await req.json();
      if (!token) return json(req, 400, { error: 'token is required' });
      return await handleConfirm(token, req);
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const token = url.searchParams.get('token') || '';
      if (!token) return html(req, 400, '<h2>잘못된 요청입니다. (토큰 누락)</h2>');
      const res = await handleConfirm(token, req);
      if (res.status === 200) {
        return html(req, 200, '<h2>계정이 삭제되었습니다.</h2><p>앱에서 로그아웃 후 재실행해 주세요.</p>');
      } else {
        const body = await res.json().catch(() => ({} as any));
        return html(req, res.status, `<h2>삭제 실패</h2><pre>${(body as any)?.error || '오류'}</pre>`);
      }
    }

    return json(req, 405, { error: 'Method Not Allowed' });
  } catch (e) {
    console.error('Unhandled error:', e);
    return json(req, 500, { error: 'internal error' });
  }
});
