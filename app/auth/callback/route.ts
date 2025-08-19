import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const { user, session } = data;
      if (user && session.provider_token) {
        await supabase.auth.updateUser({
          data: {
            provider_token: session.provider_token,
            user_name: user.user_metadata.user_name,
            avatar_url: user.user_metadata.avatar_url,
            full_name: user.user_metadata.full_name,
          },
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}auth/auth-code-error`);
}
