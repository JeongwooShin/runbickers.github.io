// deno-lint-ignore-file no-explicit-any
import { supabaseAdmin } from "../_shared/supabaseClients.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";

const RPC_NAME = Deno.env.get("DB_DELETE_RPC_NAME") || "delete_user_account";
const RPC_PARAM = Deno.env.get("DB_DELETE_RPC_PARAM") || "p_user_id";

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method Not Allowed" }, 405);
  }

  try {
    const { token } = await req.json() as { token?: string };
    if (!token) return jsonResponse(req, { error: "토큰이 필요합니다." }, 400);

    // 1) 토큰 조회/검증
    const { data: row, error: selErr } = await supabaseAdmin
      .from("delete_tokens")
      .select("id, user_id, email, used, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (selErr) {
      console.error(selErr);
      return jsonResponse(req, { error: "토큰 조회 실패" }, 500);
    }
    if (!row) return jsonResponse(req, { error: "유효하지 않은 토큰입니다." }, 400);
    if (row.used) return jsonResponse(req, { error: "이미 사용된 토큰입니다." }, 400);
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return jsonResponse(req, { error: "만료된 토큰입니다." }, 400);
    }

    // 2) 데이터 삭제 (사용자 정의 RPC)
    try {
      const { error: rpcErr } = await supabaseAdmin.rpc(RPC_NAME, { [RPC_PARAM]: row.user_id });
      if (rpcErr) {
        // RPC가 없거나 파라미터명이 다를 수 있으니 로깅
        console.warn("RPC 호출 실패 (무시 가능, 다음 단계 진행):", rpcErr.message);
      }
    } catch (e) {
      console.warn("RPC 호출 예외 (무시 가능):", e);
    }

    // 3) Auth 유저 삭제 (항상 실행해 계정 정리)
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(row.user_id);
    if (authErr) {
      console.error("Auth 삭제 실패:", authErr);
      // 유저가 이미 없는 경우도 있으므로 하드 실패로 처리하지 않고 계속 진행
    }

    // 4) 토큰 사용 처리
    const { error: updErr } = await supabaseAdmin
      .from("delete_tokens")
      .update({ used: true })
      .eq("token", token);
    if (updErr) {
      console.error("토큰 사용처리 실패:", updErr);
    }

    return jsonResponse(req, { ok: true, email: row.email });
  } catch (e: any) {
    console.error(e);
    return jsonResponse(req, { error: "서버 오류가 발생했습니다." }, 500);
  }
});
