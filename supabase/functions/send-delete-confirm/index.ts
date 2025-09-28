import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

// 운영 From: 반드시 Verified된 도메인의 주소여야 함
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'Runbickers <noreply@mail.runbickers.com>';

// 여러 Origin 허용(시크릿 있으면 그것을 우선 사용)
const ALLOWED_ORIGINS = (Deno.env.get('CORS_ALLOWED_ORIGINS') ||
  'https://jeongwooshin.github.io,https://btcmobick.runbickers.com')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null) {
  const h: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req.headers.get('origin')) });
  }
  if (req.method !== 'POST') return json(req, 405, { error: 'Method Not Allowed' });

  try {
    const { email, password, nickname, reason } = await req.json();
    if (!email || !password) return json(req, 400, { error: 'email/password is required' });

    // 1) 비밀번호 재검증
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: signIn, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
    if (signInErr || !signIn?.user) return json(req, 401, { error: 'Invalid credentials' });

    const userId = signIn.user.id;
    const token = crypto.randomUUID();

    // 2) 토큰 저장
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const row = { user_id: userId, email, token, reason: reason || null, nickname: nickname || null };
    const { error: insertErr } = await admin.from('account_deletion_tokens').insert(row);
    if (insertErr) {
      console.error('Insert error:', insertErr, 'row:', row);
      return json(req, 500, { error: '토큰 저장에 실패했습니다.' });
    }

    // 3) 확인 이메일 발송
    const confirmUrl = `https://jeongwooshin.github.io/runbickers.github.io/account-deletion-confirm.html?token=${encodeURIComponent(token)}`;
    const emailHtml = `<p>회원탈퇴 확인을 위해 아래 링크를 클릭하세요 (24시간 유효)</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`;

    console.log('EMAIL_FROM =>', EMAIL_FROM);

    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: EMAIL_FROM, to: [email], subject: 'Runbickers 회원탈퇴 확인', html: emailHtml }),
      });

      const text = await emailRes.text().catch(() => '');
      if (!emailRes.ok) {
        console.error('Email send failed:', emailRes.status, text);
        return json(req, 502, {
          error: '이메일 전송에 실패했습니다.',
          resend_status: emailRes.status,
          resend_error: text.slice(0, 1000),
        });
      }
    } catch (e) {
      console.error('Email fetch threw:', e);
      return json(req, 502, { error: '이메일 전송 중 네트워크 오류', detail: String(e) });
    }

    return json(req, 200, { ok: true });
  } catch (e) {
    console.error('Unhandled error:', e);
    return json(req, 500, { error: 'internal error' });
  }
});
