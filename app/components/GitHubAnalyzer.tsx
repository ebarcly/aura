// app/components/GitHubAnalyzer.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Github,
  Star,
  GitFork,
  Code,
  Users,
  TrendingUp,
  Download,
  Share2,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import LogoutButton from "@/app/components/LogoutButton";

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  topics: string[];
  private: boolean;
}

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  location: string | null;
  company: string | null;
}

interface AnalysisData {
  languages: Array<{
    name: string;
    bytes: number;
    percentage: number;
  }>;
  commits: {
    total: number;
    userCommits: number;
    byMonth: Array<{
      month: string;
      year: string;
      commits: number;
    }>;
    averagePerMonth: number;
  };
  collaboration: {
    contributors: number;
    issues: number;
    pullRequests: number;
    isCollaborative: boolean;
  };
  codeQuality: {
    hasReadme: boolean;
    hasLicense: boolean;
    hasTests: boolean;
    documentationScore: number;
  };
}

export default function GitHubAnalyzer({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [analysisData, setAnalysisData] = useState<{
    [key: number]: AnalysisData;
  }>({});

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const fetchGitHubData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/github/repos");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch GitHub data");
      }

      const data = await response.json();
      setGithubUser(data.user);
      setRepositories(data.repositories);

      // Auto-select top 5 repositories by stars
      const topRepos = data.repositories
        .sort(
          (a: Repository, b: Repository) =>
            b.stargazers_count - a.stargazers_count
        )
        .slice(0, 5);

      setSelectedRepos(new Set(topRepos.map((repo: Repository) => repo.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const analyzeSelectedRepositories = async () => {
    if (selectedRepos.size === 0) {
      setError("Please select at least one repository to analyze");
      return;
    }

    setAnalyzing(true);
    setError("");
    const newAnalysisData: { [key: number]: AnalysisData } = {};

    try {
      const selectedReposList = repositories.filter((repo) =>
        selectedRepos.has(repo.id)
      );

      for (const repo of selectedReposList) {
        const response = await fetch(
          `/api/github/analyze/${githubUser?.login}/${repo.name}`
        );

        if (response.ok) {
          const analysis = await response.json();
          newAnalysisData[repo.id] = analysis;
        } else {
          console.error(`Failed to analyze ${repo.name}`);
        }
      }

      setAnalysisData(newAnalysisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleRepoSelection = (repoId: number) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId);
    } else {
      newSelected.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  const getOverallStats = () => {
    const analyses = Object.values(analysisData);
    if (analyses.length === 0) return null;

    const totalCommits = analyses.reduce(
      (sum, analysis) => sum + analysis.commits.userCommits,
      0
    );
    const totalContributors = analyses.reduce(
      (sum, analysis) => sum + analysis.collaboration.contributors,
      0
    );
    const avgQuality = Math.round(
      analyses.reduce(
        (sum, analysis) => sum + analysis.codeQuality.documentationScore,
        0
      ) / analyses.length
    );

    // Combine all languages
    const allLanguages: { [key: string]: number } = {};
    analyses.forEach((analysis) => {
      analysis.languages.forEach((lang) => {
        allLanguages[lang.name] = (allLanguages[lang.name] || 0) + lang.bytes;
      });
    });

    const totalBytes = Object.values(allLanguages).reduce(
      (sum, bytes) => sum + bytes,
      0
    );
    const topLanguages = Object.entries(allLanguages)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: Math.round((bytes / totalBytes) * 100),
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 5);

    return {
      totalCommits,
      totalContributors,
      avgQuality,
      topLanguages,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your GitHub data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchGitHubData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const overallStats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  window.open(
                    `https://github.com/${githubUser?.login}`,
                    "_blank"
                  )
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

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Public Repos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {githubUser?.public_repos}
                </p>
              </div>
              <Code className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Stars</p>
                <p className="text-2xl font-bold text-gray-900">
                  {repositories.reduce(
                    (sum, repo) => sum + repo.stargazers_count,
                    0
                  )}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Followers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {githubUser?.followers}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Following</p>
                <p className="text-2xl font-bold text-gray-900">
                  {githubUser?.following}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Repository Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Select Repositories to Analyze
            </h2>
            <Button
              onClick={analyzeSelectedRepositories}
              disabled={selectedRepos.size === 0 || analyzing}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Selected ({selectedRepos.size})
                </>
              )}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories.slice(0, 12).map((repo) => (
              <div
                key={repo.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRepos.has(repo.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleRepoSelection(repo.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {repo.name}
                      </h3>
                      {selectedRepos.has(repo.id) && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {repo.description || "No description available"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        {repo.forks_count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Results */}
        {overallStats && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Analysis */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Analysis Overview
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Total Commits Analyzed
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {overallStats.totalCommits}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Code Quality Score
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      {overallStats.avgQuality}/100
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Top Languages
                </h2>
                <div className="space-y-4">
                  {overallStats.topLanguages.map((lang, index) => (
                    <div
                      key={lang.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="font-medium">{lang.name}</span>
                      </div>
                      <span className="text-gray-600">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <h2 className="text-xl font-bold mb-2">Analysis Complete!</h2>
                <p className="text-green-100 text-sm">
                  {Object.keys(analysisData).length} repositories analyzed
                </p>
                <div className="mt-4 space-y-2">
                  <Button
                    className="w-full bg-white/20 hover:bg-white/30 border-0"
                    onClick={() => {
                      /* TODO: Implement share */
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Report
                  </Button>
                  <Button
                    className="w-full bg-white/20 hover:bg-white/30 border-0"
                    onClick={() => {
                      /* TODO: Implement download */
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
