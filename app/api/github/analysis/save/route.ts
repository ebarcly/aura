import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { repositoryData, analysisData } = body;

    // Calculate overall scores
    const codeQualityScore = calculateCodeQualityScore(
      analysisData.codeQuality
    );
    const collaborationScore = calculateCollaborationScore(
      analysisData.collaboration
    );
    const consistencyScore = calculateConsistencyScore(analysisData.commits);

    // Save repository analysis
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("repository_analyses")
      .upsert(
        {
          user_id: user.id,
          repository_name: repositoryData.name,
          repository_url: repositoryData.html_url,
          repository_description: repositoryData.description,
          primary_language: repositoryData.language,
          stars_count: repositoryData.stargazers_count,
          forks_count: repositoryData.forks_count,

          // Language breakdown
          languages: analysisData.languages,

          // Commit analysis
          total_commits: analysisData.commits.total,
          user_commits: analysisData.commits.userCommits,
          commits_by_month: analysisData.commits.byMonth,
          average_commits_per_month: analysisData.commits.averagePerMonth,

          // Collaboration metrics
          contributors_count: analysisData.collaboration.contributors,
          issues_count: analysisData.collaboration.issues,
          pull_requests_count: analysisData.collaboration.pullRequests,
          is_collaborative: analysisData.collaboration.isCollaborative,

          // Code quality metrics
          has_readme: analysisData.codeQuality.hasReadme,
          has_license: analysisData.codeQuality.hasLicense,
          has_tests: analysisData.codeQuality.hasTests,
          documentation_score: analysisData.codeQuality.documentationScore,

          // Overall scores
          code_quality_score: codeQualityScore,
          collaboration_score: collaborationScore,
          consistency_score: consistencyScore,
        },
        {
          onConflict: "user_id,repository_name",
          ignoreDuplicates: false,
        }
      );

    if (saveError) {
      throw saveError;
    }

    // Update user profile with latest GitHub data
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        github_username: user.user_metadata?.user_name,
        github_avatar_url: user.user_metadata?.avatar_url,
        github_name: user.user_metadata?.full_name,
        followers_count: repositoryData.owner?.followers || 0,
        following_count: repositoryData.owner?.following || 0,
        public_repos_count: repositoryData.owner?.public_repos || 0,
      },
      {
        onConflict: "id",
        ignoreDuplicates: false,
      }
    );

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Don't fail the entire request if profile update fails
    }

    return NextResponse.json({
      success: true,
      analysisId: savedAnalysis?.[0]?.id,
      scores: {
        codeQuality: codeQualityScore,
        collaboration: collaborationScore,
        consistency: consistencyScore,
      },
    });
  } catch (error) {
    console.error("Error saving analysis:", error);
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}

function calculateCodeQualityScore(codeQuality: any): number {
  let score = 0;

  if (codeQuality.hasReadme) score += 25;
  if (codeQuality.hasLicense) score += 20;
  if (codeQuality.hasTests) score += 30;
  score += Math.round(codeQuality.documentationScore * 0.25);

  return Math.min(score, 100);
}

function calculateCollaborationScore(collaboration: any): number {
  let score = 30; // Base score

  if (collaboration.contributors > 1) score += 20;
  if (collaboration.contributors > 5) score += 10;
  if (collaboration.pullRequests > 0) score += 20;
  if (collaboration.issues > 0) score += 10;
  if (collaboration.pullRequests > collaboration.issues) score += 10;

  return Math.min(score, 100);
}

function calculateConsistencyScore(commits: any): number {
  const monthlyCommits = commits.byMonth || [];

  if (monthlyCommits.length === 0) return 0;

  // Calculate consistency based on regular commits
  const totalCommits = monthlyCommits.reduce(
    (sum: number, month: any) => sum + month.commits,
    0
  );
  const averageCommits = totalCommits / monthlyCommits.length;
  const variance =
    monthlyCommits.reduce((sum: number, month: any) => {
      return sum + Math.pow(month.commits - averageCommits, 2);
    }, 0) / monthlyCommits.length;

  // Lower variance = higher consistency
  const consistencyFactor = Math.max(0, 100 - (variance / averageCommits) * 20);

  // Factor in total commit volume
  const volumeFactor = Math.min(totalCommits / 50, 1) * 100;

  return Math.round(consistencyFactor * 0.7 + volumeFactor * 0.3);
}
