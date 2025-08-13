"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
