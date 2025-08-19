import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GitHubAnalyzer from "@/app/components/GitHubAnalyzer";
import { Suspense } from "react";

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

  if (!hasGitHubToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            GitHub Access Required
          </h2>
          <p className="text-center text-gray-600">
            We need access to your GitHub account to analyze your repositories!
          </p>
          <div className="text-center">
            <a
              href="/api/auth/github"
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Connect GitHub Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  const appUser = {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata.name,
    avatar_url: user.user_metadata.avatar_url,
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GitHubAnalyzer user={appUser} />
    </Suspense>
  );
}
