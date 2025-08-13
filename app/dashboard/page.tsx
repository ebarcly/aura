import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white">Dashboard</h2>
        <p className="text-center text-gray-400">Welcome back!</p>
        <div className="space-y-4 text-white">
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
