import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the GitHub access token from user metadata
    const githubToken = user.user_metadata?.provider_token;

    if (!githubToken) {
      return NextResponse.json(
        {
          error: "GitHub token not found. Please re-authenticate.",
        },
        { status: 400 }
      );
    }

    const githubUsername = user.user_metadata?.user_name;

    // Fetch user's repositories
    const reposResponse = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AURA-App",
        },
      }
    );

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status}`);
    }

    const repos = await reposResponse.json();

    // Fetch user's profile data
    const userResponse = await fetch(`https://api.github.com/user`, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AURA-App",
      },
    });

    const githubUser = await userResponse.json();

    // Filter out forked repos and get only owned repos
    const ownedRepos = repos.filter((repo: any) => !repo.fork);

    return NextResponse.json({
      user: githubUser,
      repositories: ownedRepos,
      totalRepos: ownedRepos.length,
    });
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}
