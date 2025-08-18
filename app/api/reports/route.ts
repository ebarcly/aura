import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repositoryIds, reportName, isPublic } = await request.json();

    // Fetch the analyses for the specified repositories
    const { data: analyses, error: analysesError } = await supabase
      .from("repository_analyses")
      .select("*")
      .in("id", repositoryIds)
      .eq("user_id", user.id);

    if (analysesError) {
      throw analysesError;
    }

    if (!analyses || analyses.length === 0) {
      return NextResponse.json({ error: "No analyses found" }, { status: 404 });
    }

    // Calculate aggregated metrics
    const totalRepositories = analyses.length;
    const totalCommits = analyses.reduce(
      (sum, analysis) => sum + analysis.user_commits,
      0
    );
    const totalStars = analyses.reduce(
      (sum, analysis) => sum + analysis.stars_count,
      0
    );
    const overallScore = Math.round(
      analyses.reduce((sum, analysis) => {
        return (
          sum +
          (analysis.code_quality_score +
            analysis.collaboration_score +
            analysis.consistency_score) /
            3
        );
      }, 0) / analyses.length
    );

    // Generate share token if public
    const shareToken = isPublic ? nanoid(10) : null;

    // Save the report
    const { data: report, error: reportError } = await supabase
      .from("analysis_reports")
      .insert({
        user_id: user.id,
        report_name: reportName,
        repository_ids: repositoryIds,
        total_repositories: totalRepositories,
        total_commits: totalCommits,
        total_stars: totalStars,
        overall_score: overallScore,
        is_public: isPublic,
        share_token: shareToken,
      })
      .select()
      .single();

    if (reportError) {
      throw reportError;
    }

    return NextResponse.json({
      success: true,
      report,
      shareUrl: shareToken
        ? `${process.env.NEXT_PUBLIC_APP_URL}/reports/${shareToken}`
        : null,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's reports
    const { data: reports, error: reportsError } = await supabase
      .from("analysis_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (reportsError) {
      throw reportsError;
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}