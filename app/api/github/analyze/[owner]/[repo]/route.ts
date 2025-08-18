import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface GitHubContent {
  name: string;
  type: string;
}

interface GitHubCommit {
  author: {
    login: string;
  };
  commit: {
    author: {
      date: string;
    };
  };
}

interface GitHubIssue {
  pull_request?: object;
}

interface GitHubContributor {
  login: string;
  contributions: number;
}

interface Language {
  name: string;
  bytes: number;
  percentage: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const { owner, repo } = params;
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

    const headers = {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "AURA-App",
    };

    // Fetch repository languages
    const languagesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers }
    );

    const languages = (await languagesResponse.json()) as Record<
      string,
      number
    >;

    // Fetch repository commits
    const commits = await fetchAllPages<GitHubCommit>(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
      headers
    );

    // Fetch repository contributors
    const contributors = await fetchAllPages<GitHubContributor>(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
      headers
    );

    // Fetch repository issues and PRs
    const issues = await fetchAllPages<GitHubIssue>(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`,
      headers
    );

    // Fetch repository root content to check for README and LICENSE
    const contentResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/`,
      { headers }
    );

    const content = await contentResponse.json();

    const hasReadme = Array.isArray(content)
      ? content.some((file: GitHubContent) =>
          file.name.toLowerCase().startsWith("readme")
        )
      : false;
    const hasLicense = Array.isArray(content)
      ? content.some((file: GitHubContent) =>
          file.name.toLowerCase().startsWith("license")
        )
      : false;

    const hasTests = await checkForTests(owner, repo, githubToken);

    // Process the data
    const totalBytes = Object.values(languages).reduce(
      (sum: number, bytes: number) => sum + bytes,
      0
    );
    const languageBreakdown: Language[] = Object.entries(languages).map(
      ([name, bytes]: [string, number]) => ({
        name,
        bytes,
        percentage: Math.round((bytes / totalBytes) * 100),
      })
    );

    // Analyze commit patterns
    const commitsByMonth = analyzeCommitPatterns(commits);
    const userCommits = commits.filter(
      (commit: GitHubCommit) =>
        commit.author?.login === user.user_metadata?.user_name
    );

    // Separate issues and pull requests
    const pullRequests = issues.filter(
      (item: GitHubIssue) => item.pull_request
    );
    const actualIssues = issues.filter(
      (item: GitHubIssue) => !item.pull_request
    );

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
        hasReadme,
        hasLicense,
        hasTests,
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

function analyzeCommitPatterns(commits: GitHubCommit[]) {
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

  commits.forEach((commit: GitHubCommit) => {
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

function calculateDocumentationScore(languages: Language[]): number {
  const hasMarkdown = languages.some((lang) => lang.name === "Markdown");
  const hasComments = languages.some((lang) =>
    ["JavaScript", "TypeScript", "Python", "Java", "C++"].includes(lang.name)
  );

  let score = 50; // Base score
  if (hasMarkdown) score += 30;
  if (hasComments) score += 20;

  return Math.min(score, 100);
}

async function checkForTests(
  owner: string,
  repo: string,
  token: string
): Promise<boolean> {
  const commonTestDirs = ["test", "tests", "__tests__"];
  const commonTestFiles = [".test.", ".spec.", "_test.go", "test_", "_spec.rb"];

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AURA-App",
        },
      }
    );

    if (!response.ok) {
      console.warn("Failed to fetch repository tree. Assuming no tests.");
      return false;
    }

    const { tree } = await response.json();

    if (!Array.isArray(tree)) {
      return false;
    }

    for (const item of tree) {
      const path = item.path.toLowerCase();

      // Check for common test directories
      if (commonTestDirs.some((dir) => path.includes(`${dir}/`))) {
        return true;
      }

      // Check for common test file patterns
      if (commonTestFiles.some((file) => path.includes(file))) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking for tests:", error);
    return false;
  }
}

async function fetchAllPages<T>(
  url: string,
  headers: HeadersInit
): Promise<T[]> {
  let results: T[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const response: Response = await fetch(nextUrl, { headers });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `GitHub API request failed: ${response.statusText} - ${errorBody}`
      );
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error("Expected array from GitHub API but got:", data);
      throw new Error("Invalid data format from GitHub API.");
    }
    results = results.concat(data);

    const linkHeader = response.headers.get("Link");
    if (linkHeader) {
      const nextLink = linkHeader
        .split(",")
        .find((s) => s.includes('rel="next"'));
      if (nextLink) {
        const match = nextLink.match(/<([^>]+)>/);
        if (match) {
          nextUrl = match[1];
        } else {
          nextUrl = null;
        }
      } else {
        nextUrl = null;
      }
    } else {
      nextUrl = null;
    }
  }

  return results;
}
