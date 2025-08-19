// app/components/UserProfileHeader.tsx
import React from "react";
import { Github } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import LogoutButton from "@/app/components/LogoutButton";
import { GitHubUser } from "@/lib/types";

interface UserProfileHeaderProps {
  githubUser: GitHubUser | null;
}

export default function UserProfileHeader({
  githubUser,
}: UserProfileHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={githubUser?.avatar_url}
              alt={githubUser?.name || githubUser?.login}
              className="w-16 h-16 rounded-full border-4 border-white/30"
            />
            <div>
              <h1 className="text-3xl font-bold">
                {githubUser?.name || githubUser?.login}
              </h1>
              <p className="text-blue-100">@{githubUser?.login}</p>
              {githubUser?.bio && (
                <p className="text-blue-200 text-sm mt-1">{githubUser.bio}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() =>
                window.open(`https://github.com/${githubUser?.login}`, "_blank")
              }
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Github className="w-4 h-4 mr-2" />
              View Profile
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
