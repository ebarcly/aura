import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";
import TokenDebug from "@/app/components/TokenDebug";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has GitHub token
  const hasGitHubToken = user.user_metadata?.provider_token;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>GitHub Username:</strong>{" "}
              {user.user_metadata?.user_name || "N/A"}
            </div>
            <div>
              <strong>Name:</strong> {user.user_metadata?.full_name || "N/A"}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Provider Token:</strong>
              <span
                className={hasGitHubToken ? "text-green-600" : "text-red-600"}
              >
                {hasGitHubToken ? " Present" : " Missing"}
              </span>
            </div>
          </div>
        </div>

        {/* Token Debug Component */}
        <TokenDebug />

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {hasGitHubToken
              ? "✅ GitHub Connected!"
              : "⚠️ GitHub Token Missing"}
          </h3>
          <p className="text-blue-800 text-sm">
            {hasGitHubToken
              ? "Your GitHub account is properly connected. You can now use the full analysis features."
              : "You need to re-authenticate with GitHub to get repository access. Please log out and log back in."}
          </p>
        </div>
      </div>
    </div>
  );
}
