import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();

  const { data } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
      scopes: "read:user user:email repo",
    },
  });

  if (data.url) {
    return NextResponse.redirect(data.url);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect("/login?error=oauth_error");
}
