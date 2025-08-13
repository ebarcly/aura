import { createClient } from "@/lib/supabase/server";
import LoginButton from "@/app/components/LoginButton";
import LogoutButton from "@/app/components/LogoutButton";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AURA</h1>
        <p className="text-xl text-gray-400 mb-8">
          Your AI-powered developer portfolio.
        </p>
        {user ? <LogoutButton /> : <LoginButton />}
      </div>
    </main>
  );
}
