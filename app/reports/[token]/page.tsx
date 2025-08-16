import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Github,
  Star,
  GitFork,
  Code,
  Users,
  TrendingUp,
  Calendar,
  Award,
} from "lucide-react";

interface ReportPageProps {
  params: { token: string };
}

export default async function PublicReportPage({ params }: ReportPageProps) {
  const supabase = await createClient();

  // Fetch the report by share token
  const { data: report, error: reportError } = await supabase
    .from("analysis_reports")
    .select(
      `
      *,
      profiles (
        github_username,
        github_name,
        github_avatar_url
      )
    `
    )
    .eq("share_token", params.token)
    .eq("is_public", true)
    .single();

  if (reportError || !report) {
    notFound();
  }

  // Fetch the repository analyses for this report
  const { data: analyses, error: analysesError } = await supabase
    .from("repository_analyses")
    .select("*")
    .in("id", report.repository_ids)
    .eq("user_id", report.user_id);

  if (analysesError || !analyses) {
    notFound();
  }

  // Calculate aggregated language data
  const languageMap: { [key: string]: number } = {};
  analyses.forEach((analysis) => {
    if (analysis.languages && Array.isArray(analysis.languages)) {
      analysis.languages.forEach((lang: any) => {
        languageMap[lang.name] = (languageMap[lang.name] || 0) + lang.bytes;
      });
    }
  });

  const totalBytes = Object.values(languageMap).reduce(
    (sum, bytes) => sum + bytes,
    0
  );
  const topLanguages = Object.entries(languageMap)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 100),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5);

  // Update view count
  await supabase
    .from("analysis_reports")
    .update({ view_count: (report.view_count || 0) + 1 })
    .eq("id", report.id);

  const profile = report.profiles;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            {profile?.github_avatar_url && (
              <img
                src={profile.github_avatar_url}
                alt={profile.github_name || profile.github_username}
                className="w-20 h-20 rounded-full border-4 border-white/30 mx-auto mb-4"
              />
            )}
            <h1 className="text-4xl font-bold mb-2">
              {profile?.github_name || profile?.github_username}'s Developer
              Portfolio
            </h1>
            <p className="text-xl text-blue-100 mb-4">{report.report_name}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                {report.total_repositories} repositories analyzed
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {report.total_commits} commits
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                {report.total_stars} stars earned
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overall Score */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border inline-block">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Developer Score
            </h2>
            <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
              {report.overall_score}/100
            </div>
            <p className="text-gray-600 mt-2">
              Based on code quality, collaboration, and consistency
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <Code className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {report.total_repositories}
            </p>
            <p className="text-gray-600 text-sm">Repositories</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {report.total_commits}
            </p>
            <p className="text-gray-600 text-sm">Total Commits</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {report.total_stars}
            </p>
            <p className="text-gray-600 text-sm">Stars Earned</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {analyses.reduce(
                (sum, analysis) => sum + analysis.contributors_count,
                0
              )}
            </p>
            <p className="text-gray-600 text-sm">Collaborators</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Languages */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Programming Languages
              </h2>
              <div className="space-y-4">
                {topLanguages.map((lang, index) => (
                  <div
                    key={lang.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                      <span className="font-medium text-gray-900">
                        {lang.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${lang.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm w-10 text-right">
                        {lang.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Repository Highlights */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Repository Highlights
              </h2>
              <div className="grid gap-4">
                {analyses.slice(0, 6).map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {analysis.repository_name}
                        </h3>
                        {analysis.repository_description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {analysis.repository_description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {analysis.stars_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-4 h-4" />
                          {analysis.forks_count}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">
                          {analysis.code_quality_score}
                        </p>
                        <p className="text-xs text-gray-500">Code Quality</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">
                          {analysis.collaboration_score}
                        </p>
                        <p className="text-xs text-gray-500">Collaboration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-purple-600">
                          {analysis.consistency_score}
                        </p>
                        <p className="text-xs text-gray-500">Consistency</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Developer Skills */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Key Strengths
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Code Quality
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round(
                      analyses.reduce(
                        (sum, analysis) => sum + analysis.code_quality_score,
                        0
                      ) / analyses.length
                    )}
                    /100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Collaboration
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {Math.round(
                      analyses.reduce(
                        (sum, analysis) => sum + analysis.collaboration_score,
                        0
                      ) / analyses.length
                    )}
                    /100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Consistency
                  </span>
                  <span className="text-sm font-semibold text-purple-600">
                    {Math.round(
                      analyses.reduce(
                        (sum, analysis) => sum + analysis.consistency_score,
                        0
                      ) / analyses.length
                    )}
                    /100
                  </span>
                </div>
              </div>
            </div>

            {/* Report Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Report Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated</span>
                  <span className="text-gray-900">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="text-gray-900">
                    {report.view_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GitHub Profile</span>
                  <a
                    href={`https://github.com/${profile?.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Github className="w-4 h-4" />
                    View
                  </a>
                </div>
              </div>
            </div>

            {/* Powered by AURA */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white text-center">
              <h3 className="text-lg font-bold mb-2">Create Your Own Report</h3>
              <p className="text-purple-100 text-sm mb-4">
                Generate your own comprehensive developer portfolio with AURA
              </p>
              <Link
                href="/"
                className="inline-block bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
