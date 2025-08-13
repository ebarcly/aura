"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
    }
    router.push("/login");
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
