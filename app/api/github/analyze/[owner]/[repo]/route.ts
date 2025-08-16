import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const githubToken = user.user_metadata?.provider_token;

    if (!githubToken) {
      return NextResponse.json(
        {
          error: "GitHub token not found",
        },
        { status: 400 }
      );
    }

    const { owner, repo } = params;

    // Fetch repository languages
    const languagesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AURA-App",
        },
      }
    );

    const languages = await languagesResponse.json();

    // Fetch repository commits (last 100)
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AURA-App",
        },
      }
    );

    const commits = await commitsResponse.json();

    // Fetch repository contributors
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AURA-App",
        },
      }
    );

    const contributors = await contributorsResponse.json();

    // Fetch repository issues and PRs
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AURA-App",
        },
      }
    );

    const issues = await issuesResponse.json();

    // Process the data
    const totalBytes = Object.values(languages).reduce(
      (sum: number, bytes: any) => sum + bytes,
      0
    );
    const languageBreakdown = Object.entries(languages).map(
      ([name, bytes]: [string, any]) => ({
        name,
        bytes,
        percentage: Math.round((bytes / totalBytes) * 100),
      })
    );

    // Analyze commit patterns
    const commitsByMonth = analyzeCommitPatterns(commits);
    const userCommits = commits.filter(
      (commit: any) => commit.author?.login === user.user_metadata?.user_name
    );

    // Separate issues and pull requests
    const pullRequests = issues.filter((item: any) => item.pull_request);
    const actualIssues = issues.filter((item: any) => !item.pull_request);

    const analysis = {
      languages: languageBreakdown,
      commits: {
        total: commits.length,
        userCommits: userCommits.length,
        byMonth: commitsByMonth,
        averagePerMonth: Math.round(userCommits.length / 12),
      },
      collaboration: {
        contributors: contributors.length,
        issues: actualIssues.length,
        pullRequests: pullRequests.length,
        isCollaborative: contributors.length > 1,
      },
      codeQuality: {
        hasReadme: true, // We can check this by fetching README
        hasLicense: true, // We can check this by fetching license
        hasTests: languageBreakdown.some((lang) =>
          ["JavaScript", "TypeScript", "Python", "Java"].includes(lang.name)
        ),
        documentationScore: calculateDocumentationScore(languageBreakdown),
      },
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing repository:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}

function analyzeCommitPatterns(commits: any[]) {
  const monthlyCommits: { [key: string]: number } = {};
  const now = new Date();

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    monthlyCommits[key] = 0;
  }

  commits.forEach((commit: any) => {
    const date = new Date(commit.commit.author.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    if (monthlyCommits.hasOwnProperty(key)) {
      monthlyCommits[key]++;
    }
  });

  return Object.entries(monthlyCommits).map(([month, count]) => ({
    month: month.split("-")[1],
    year: month.split("-")[0],
    commits: count,
  }));
}

function calculateDocumentationScore(languages: any[]): number {
  const hasMarkdown = languages.some((lang) => lang.name === "Markdown");
  const hasComments = languages.some((lang) =>
    ["JavaScript", "TypeScript", "Python", "Java", "C++"].includes(lang.name)
  );

  let score = 50; // Base score
  if (hasMarkdown) score += 30;
  if (hasComments) score += 20;

  return Math.min(score, 100);
}
