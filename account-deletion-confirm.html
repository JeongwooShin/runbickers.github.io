import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const ALLOWED_ORIGIN = 'https://jeongwooshin.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function badRequest(msg: string) {
  return new Response(JSON.stringify({ error: msg }), {
    status: 400,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
function serverError(msg: string) {
  return new Response(JSON.stringify({ error: msg }), {
    status: 500,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// 단일 IP만 추출하는 헬퍼
function getClientIp(req: Request): string | null {
  const cf = req.headers.get('cf-connecting-ip')?.trim();
  const real = req.headers.get('x-real-ip')?.trim();
  const xff = req.headers.get('x-forwarded-for')?.trim(); // "a, b, c"
  const firstFromXff = xff ? xff.split(',')[0]?.trim() : undefined;

  // 우선순위: cf-connecting-ip > x-real-ip > 첫 번째 XFF
  const ip = cf || real || firstFromXff || '';
  return ip || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });

  try {
    const { email, password, nickname, reason } = await req.json();
    if (!email || !password) return badRequest('email/password is required');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr || !signInData?.user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const userId = signInData.user.id;
    const token = crypto.randomUUID();
    const clientIp = getClientIp(req);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 토큰 저장 — ip 컬럼명에 맞춰 한 줄만 사용
    const row: Record<string, unknown> = {
      user_id: userId,
      email,
      token,
      reason: reason || null,
      nickname: nickname || null,
    };
    if (clientIp) {
      // 컬럼명이 ip라면:
      // row.ip = clientIp;
      // 컬럼명이 client_ip라면:
      row.client_ip = clientIp;
    }

    const { error: insertErr } = await admin.from('account_deletion_tokens').insert(row);
    if (insertErr) {
      console.error(insertErr);
      return serverError('토큰 저장에 실패했습니다.');
    }

    const confirmUrl = `https://jeongwooshin.github.io/runbickers.github.io/account-deletion-confirm.html?token=${encodeURIComponent(token)}`;
    const emailHtml = `<p>회원탈퇴 확인을 위해 아래 링크를 클릭하세요 (24시간 내 유효)</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`;

    const mail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Runbickers <noreply@runbickers.app>',
        to: [email],
        subject: 'Runbickers 회원탈퇴 확인',
        html: emailHtml,
      }),
    });
    if (!mail.ok) {
      const t = await mail.text();
      console.error('Email send failed:', t);
      return serverError('이메일 전송에 실패했습니다.');
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    console.error(e);
    return serverError('internal error');
  }
});
