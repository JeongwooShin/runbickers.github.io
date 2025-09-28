import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

// 발신자: 시크릿 EMAIL_FROM 사용, 없으면 Resend 테스트용
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'onboarding@resend.dev';

const ALLOWED_ORIGIN = 'https://jeongwooshin.github.io';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'Method Not Allowed' });

  try {
    const { email, password, nickname, reason } = await req.json();
    if (!email || !password) return json(400, { error: 'email/password is required' });

    // 1) 비밀번호 재검증
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: signIn, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
    if (signInErr || !signIn?.user) return json(401, { error: 'Invalid credentials' });

    const userId = signIn.user.id;

    // 2) 토큰 발급
    const token = crypto.randomUUID();

    // 3) 토큰 저장
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const row = {
      user_id: userId,
      email,
      token,
      reason: reason || null,
      nickname: nickname || null,
    };
    const { error: insertErr } = await admin.from('account_deletion_tokens').insert(row);
    if (insertErr) {
      console.error('Insert error:', insertErr, 'row:', row);
      return json(500, { error: '토큰 저장에 실패했습니다.' });
    }

    // 4) 확인 이메일 발송
    const confirmUrl = `https://jeongwooshin.github.io/runbickers.github.io/account-deletion-confirm.html?token=${encodeURIComponent(token)}`;
    const emailHtml = `
      <p>회원탈퇴 확인을 위해 아래 링크를 클릭하세요 (24시간 유효)</p>
      <p><a href="${confirmUrl}">${confirmUrl}</a></p>
    `;

    console.log('EMAIL_FROM =', EMAIL_FROM);

    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: EMAIL_FROM,                // 반드시 유효한 포맷이어야 함
          to: [email],
          subject: 'Runbickers 회원탈퇴 확인',
          html: emailHtml,
        }),
      });

      const text = await emailRes.text().catch(() => '');
      if (!emailRes.ok) {
        console.error('Email send failed:', emailRes.status, text);
        return json(502, {
          error: '이메일 전송에 실패했습니다.',
          resend_status: emailRes.status,
          resend_error: text.slice(0, 1000),
        });
      }
    } catch (e) {
      console.error('Email fetch threw:', e);
      return json(502, { error: '이메일 전송 중 네트워크 오류', detail: String(e) });
    }

    return json(200, { ok: true });
  } catch (e) {
    console.error('Unhandled error:', e);
    return json(500, { error: 'internal error' });
  }
});
