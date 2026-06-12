import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");
  let next = searchParams.get("next") ?? "/rooms";

  if (!next.startsWith("/")) {
    next = "/rooms";
  }

  const loginUrl = new URL("/login", origin);

  if (next !== "/rooms") {
    loginUrl.searchParams.set("next", next);
  }

  if (oauthError) {
    loginUrl.searchParams.set(
      "error",
      oauthError === "access_denied" ? "oauth_cancelled" : "oauth_callback_failed",
    );

    if (oauthErrorDescription) {
      loginUrl.searchParams.set("error_description", oauthErrorDescription);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    loginUrl.searchParams.set("error", "oauth_session_exchange_failed");
    loginUrl.searchParams.set("error_description", error.message);

    return NextResponse.redirect(loginUrl);
  }

  loginUrl.searchParams.set("error", "oauth_callback_missing_code");

  return NextResponse.redirect(loginUrl);
}
