// deno-lint-ignore-file no-explicit-any
// trigger
import { supabaseAnon, supabaseAdmin } from "../_shared/supabaseClients.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/email.ts";

const SITE_BASE_URL =
  (Deno.env.get("PUBLIC_SITE_BASE_URL") || "https://jeongwooshin.github.io/runbickers.github.io").replace(/\/$/, "");

interface Payload {
  email: string;
  password: string;
  nickname?: string;
  reason?: string;
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method Not Allowed" }, 405);
  }

  try {
    const body = (await req.json()) as Payload;
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const reason = body.reason || "";

    if (!email || !password) {
      return jsonResponse(req, { error: "이메일과 비밀번호는 필수입니다." }, 400);
    }

    // 1) 비밀번호 재인증 (anon client로 안전하게 검증)
    const { data: signinData, error: signinError } = await supabaseAnon.auth.signInWithPassword({ email, password });
    if (signinError || !signinData?.user) {
      return jsonResponse(req, { error: "인증에 실패했습니다. 이메일/비밀번호를 확인해주세요." }, 401);
    }
    const user = signinData.user;

    // 2) 토큰 생성 및 저장 (service role)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
    const ip = req.headers.get("x-forwarded-for") ?? "";
    const ua = req.headers.get("user-agent") ?? "";

    const { error: insertErr } = await supabaseAdmin.from("delete_tokens").insert({
      user_id: user.id,
      email,
      token,
      reason,
      ip,
      user_agent: ua,
      expires_at: expiresAt,
    });
    if (insertErr) {
      console.error(insertErr);
      return jsonResponse(req, { error: "토큰 저장에 실패했습니다." }, 500);
    }

    // 3) 확인 이메일 발송
    const confirmLink = `${SITE_BASE_URL}/account-deletion-confirm.html?token=${token}`;
    const subject = "Runbickers 회원탈퇴 확인";
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Apple SD Gothic Neo,Noto Sans KR,Helvetica,Arial">
        <h2>회원탈퇴를 확인해주세요</h2>
        <p>아래 버튼을 클릭하면 회원탈퇴가 완료됩니다. 이 링크는 24시간 동안만 유효합니다.</p>
        <p style="margin:24px 0">
          <a href="${confirmLink}" style="background:#10b981;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;display:inline-block">
            회원탈퇴 확인
          </a>
        </p>
        <p>버튼이 동작하지 않으면 다음 링크를 브라우저에 붙여넣으세요:<br/>
          <a href="${confirmLink}">${confirmLink}</a>
        </p>
        <hr/>
        <small>요청하지 않았다면 이 메일을 무시하세요. 계정은 삭제되지 않습니다.</small>
      </div>
    `;
    await sendEmail({ to: email, subject, html });

    return jsonResponse(req, { ok: true });
  } catch (e: any) {
    console.error(e);
    return jsonResponse(req, { error: "서버 오류가 발생했습니다." }, 500);
  }
});
