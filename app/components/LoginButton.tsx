"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/button";
import { Github } from "lucide-react";

export default function LoginButton() {
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: "read:user user:email repo",
      },
    });
  };

  return (
    <Button onClick={handleLogin} className="bg-gray-900 hover:bg-gray-800">
      <Github className="w-4 h-4 mr-2" />
      Login with GitHub
    </Button>
  );
}
