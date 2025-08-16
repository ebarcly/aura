"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";

export default function TokenDebug() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const checkToken = async () => {
    setLoading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const info = {
        hasUser: !!user,
        hasSession: !!session,
        providerToken: user?.user_metadata?.provider_token
          ? "Present"
          : "Missing",
        sessionProviderToken: session?.provider_token ? "Present" : "Missing",
        userName: user?.user_metadata?.user_name,
        userMetadataKeys: user?.user_metadata
          ? Object.keys(user.user_metadata)
          : [],
      };

      setTokenInfo(info);

      // Test GitHub API call if token exists
      if (user?.user_metadata?.provider_token) {
        try {
          const response = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `token ${user.user_metadata.provider_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });

          info.githubApiTest = response.ok
            ? "Success"
            : `Failed: ${response.status}`;
          info.githubApiResponse = response.ok
            ? await response.json()
            : await response.text();
        } catch (error) {
          info.githubApiTest = `Error: ${error}`;
        }

        setTokenInfo({ ...info });
      }
    } catch (error) {
      setTokenInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">GitHub Token Debug</h3>

      <Button onClick={checkToken} disabled={loading} className="mb-4">
        {loading ? "Checking..." : "Check Token Status"}
      </Button>

      {tokenInfo && (
        <div className="bg-gray-100 p-4 rounded text-sm">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
