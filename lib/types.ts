// lib/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

export interface GitHubUser {
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

export interface Repository {
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

export interface AnalysisData {
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
