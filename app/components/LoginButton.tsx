"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/button";

export default function LoginButton() {
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return <Button onClick={handleLogin}>Login with GitHub</Button>;
}
