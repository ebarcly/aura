// app/api/github/analysis/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface CodeQuality {
  hasReadme: boolean;
  hasLicense: boolean;
  hasTests: boolean;
  documentationScore: number;
}

interface Collaboration {
  contributors: number;
  issues: number;
  pullRequests: number;
  isCollaborative: boolean;
}

interface Commits {
  total: number;
  userCommits: number;
  byMonth: { month: string; year: string; commits: number }[];
  averagePerMonth: number;
}

interface MonthlyCommit {
  commits: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repositoryData, analysisData, githubUserData } = body;

    // ... (Your score calculation functions remain the same)
    const codeQualityScore = calculateCodeQualityScore(
      analysisData.codeQuality
    );
    const collaborationScore = calculateCollaborationScore(
      analysisData.collaboration
    );
    const consistencyScore = calculateConsistencyScore(analysisData.commits);

    // Upsert into repository_analyses table
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("repository_analyses")
      .upsert(
        {
          user_id: user.id,
          repository_name: repositoryData.name,
          repository_url: repositoryData.html_url,
          // ... (rest of the fields are the same)
          repository_description: repositoryData.description,
          primary_language: repositoryData.language,
          stars_count: repositoryData.stargazers_count,
          forks_count: repositoryData.forks_count,
          languages: analysisData.languages,
          total_commits: analysisData.commits.total,
          user_commits: analysisData.commits.userCommits,
          commits_by_month: analysisData.commits.byMonth,
          average_commits_per_month: analysisData.commits.averagePerMonth,
          contributors_count: analysisData.collaboration.contributors,
          issues_count: analysisData.collaboration.issues,
          pull_requests_count: analysisData.collaboration.pullRequests,
          is_collaborative: analysisData.collaboration.isCollaborative,
          has_readme: analysisData.codeQuality.hasReadme,
          has_license: analysisData.codeQuality.hasLicense,
          has_tests: analysisData.codeQuality.hasTests,
          documentation_score: analysisData.codeQuality.documentationScore,
          code_quality_score: codeQualityScore,
          collaboration_score: collaborationScore,
          consistency_score: consistencyScore,
        },
        {
          onConflict: "user_id,repository_name",
        }
      )
      .select()
      .single();

    if (saveError) {
      console.error("Analysis Save Error:", saveError);
      throw saveError;
    }

    // Upsert into profiles table
    if (githubUserData) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          github_username: githubUserData.login,
          github_avatar_url: githubUserData.avatar_url,
          github_name: githubUserData.name,
          github_bio: githubUserData.bio,
          github_location: githubUserData.location,
          github_company: githubUserData.company,
          followers_count: githubUserData.followers,
          following_count: githubUserData.following,
          public_repos_count: githubUserData.public_repos,
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) {
        console.error("Profile update error:", profileError);
        // Non-critical, so we don't throw an error
      }
    }

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis,
    });
  } catch (error) {
    console.error("Error in save analysis route:", error);
    return NextResponse.json(
      {
        error: "Failed to save analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ... (Your score calculation functions remain here)
function calculateCodeQualityScore(codeQuality: CodeQuality): number {
  let score = 0;
  if (codeQuality.hasReadme) score += 25;
  if (codeQuality.hasLicense) score += 20;
  if (codeQuality.hasTests) score += 30;
  score += Math.round(codeQuality.documentationScore * 0.25);
  return Math.min(score, 100);
}
function calculateCollaborationScore(collaboration: Collaboration): number {
  let score = 30;
  if (collaboration.contributors > 1) score += 20;
  if (collaboration.contributors > 5) score += 10;
  if (collaboration.pullRequests > 0) score += 20;
  if (collaboration.issues > 0) score += 10;
  if (collaboration.pullRequests > collaboration.issues) score += 10;
  return Math.min(score, 100);
}
function calculateConsistencyScore(commits: Commits): number {
  const monthlyCommits = commits.byMonth || [];
  if (monthlyCommits.length === 0) return 0;
  const totalCommits = monthlyCommits.reduce(
    (sum: number, month: MonthlyCommit) => sum + month.commits,
    0
  );
  const averageCommits = totalCommits / monthlyCommits.length;
  const variance =
    monthlyCommits.reduce((sum: number, month: MonthlyCommit) => {
      return sum + Math.pow(month.commits - averageCommits, 2);
    }, 0) / monthlyCommits.length;
  const consistencyFactor = Math.max(0, 100 - (variance / averageCommits) * 20);
  const volumeFactor = Math.min(totalCommits / 50, 1) * 100;
  return Math.round(consistencyFactor * 0.7 + volumeFactor * 0.3);
}
