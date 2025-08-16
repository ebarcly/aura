import { createClient } from "@/lib/supabase/server";
import LoginButton from "@/app/components/LoginButton";
import LogoutButton from "@/app/components/LogoutButton";
import {
  Github,
  Code,
  TrendingUp,
  Award,
  Share2,
  Download,
  Users,
  Star,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Github className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            AURA
          </h1>
          <p className="text-2xl text-blue-200 mb-4 font-medium">
            The Developer Super-Portfolio
          </p>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your GitHub profile into a comprehensive, data-driven
            portfolio that proves your skills beyond traditional resumes. Get
            deep insights, shareable reports, and stand out to employers.
          </p>

          <div className="flex items-center justify-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-lg shadow-2xl"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Dashboard
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Deep Code Analysis
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Analyze language distribution, code complexity, and technical
              patterns across all your repositories with advanced metrics.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Performance Tracking
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Track contribution patterns, consistency scores, and collaboration
              metrics that show your growth over time.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Shareable Reports
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Generate professional reports you can share with employers,
              clients, or colleagues to showcase your expertise.
            </p>
          </div>
        </div>

        {/* What You Get */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            What Makes AURA Different
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Go beyond static resumes with live data that tells your real
            development story
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Real-Time GitHub Integration
                </h3>
                <p className="text-gray-300">
                  Connect your GitHub account and get instant analysis of your
                  actual code and contribution patterns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-gray-300">
                  Get detailed insights into code quality, collaboration
                  patterns, and technical skill distribution.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Collaboration Metrics
                </h3>
                <p className="text-gray-300">
                  Showcase your ability to work with teams through pull request
                  analysis and community contributions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Download className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Professional Reports
                </h3>
                <p className="text-gray-300">
                  Export beautiful PDF reports or share public links that work
                  great for job applications.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">Perfect For:</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Developers seeking new opportunities</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Freelancers showcasing their expertise</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Students building their portfolio</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Teams tracking development metrics</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>Open source contributors</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Showcase Your Real Skills?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join developers who are already using AURA to stand out in the
              competitive tech market.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <LoginButton />
                <p className="text-gray-400 text-sm">
                  Free to use • No credit card required
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
