'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ReadinessPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReadinessData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load the latest readiness assessment for this startup
      const { data: assessmentData, error } = await supabase
        .from('readiness_assessments')
        .select('*')
        .eq('startup_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading assessment:', error);
      }

      setUser(user);
      setAssessment(assessmentData);
      setLoading(false);
    }

    loadReadinessData();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If no assessment exists, show upload prompt
  if (!assessment) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar role="startup" userName={user?.user_metadata?.name} userEmail={user?.email} />

        <main className="flex-1 overflow-y-auto bg-neutral-silver">
          <div className="container max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <Card className="max-w-2xl w-full">
                <CardContent className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-tint-5 flex items-center justify-center">
                      <span className="text-4xl">📊</span>
                    </div>
                    <h2 className="text-h2 font-semibold mb-3">No Readiness Assessment Yet</h2>
                    <p className="text-body-2 text-neutral-grey mb-6">
                      Upload a pitch deck to get your AI-powered readiness assessment across six key dimensions.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => router.push('/onboarding/startup')}
                  >
                    Upload Pitch Deck
                  </Button>
                  <p className="text-body-3 text-neutral-grey mt-4">
                    Supported format: PDF (max 4.5MB)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Helper function to get score color
  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-neutral-grey';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper function to get score background color
  const getScoreBgColor = (score: number | null) => {
    if (!score) return 'bg-neutral-silver';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Helper function to get progress bar color
  const getProgressColor = (score: number | null) => {
    if (!score) return 'bg-neutral-grey';
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const dimensions = [
    {
      name: 'Formation',
      score: assessment.formation,
      description: 'Legal structure, IP, compliance',
    },
    {
      name: 'Business Plan',
      score: assessment.business_plan,
      description: 'Revenue maturity, unit costs, business model, expansion strategy, distribution',
    },
    {
      name: 'Pitch',
      score: assessment.pitch,
      description: 'Clarity of problem, solution, competition, ask, market, strategy',
    },
    {
      name: 'Product Readiness',
      score: assessment.product_readiness,
      description: 'Product maturity, features, user feedback',
    },
    {
      name: 'Technology Maturity',
      score: assessment.technology_maturity,
      description: 'Scalability, architecture, technical debt',
    },
    {
      name: 'Go-to-Market Readiness',
      score: assessment.go_to_market_readiness,
      description: 'GTM strategy, customer acquisition, distribution',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="startup" userName={user?.user_metadata?.name} userEmail={user?.email} />

      <main className="flex-1 overflow-y-auto bg-neutral-silver">
        <div className="container max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="text-neutral-grey hover:text-neutral-black"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-h2 font-semibold">Fundraising Readiness</h1>
            </div>
            <p className="text-body-2 text-neutral-grey ml-9">
              AI-powered assessment of your startup's readiness across key dimensions
            </p>
          </div>

          {/* Overall Score Card */}
          <Card className="mb-8">
            <CardContent>
              <div className="text-center py-8">
                <p className="text-body-2 text-neutral-grey mb-4">Overall Readiness Score</p>
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(assessment.overall_score)} mb-4`}>
                  <span className={`text-5xl font-bold ${getScoreColor(assessment.overall_score)}`}>
                    {assessment.overall_score || 0}
                  </span>
                </div>
                <p className="text-body-3 text-neutral-grey">
                  Weighted average across all dimensions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dimension Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dimensions.map((dimension, index) => (
              <Card key={index}>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-body-2-medium text-neutral-black mb-1">
                        {dimension.name}
                      </h3>
                      <p className="text-body-4 text-neutral-grey">
                        {dimension.description}
                      </p>
                    </div>
                    <div className={`ml-4 flex items-center justify-center w-16 h-16 rounded-full ${getScoreBgColor(dimension.score)}`}>
                      <span className={`text-2xl font-bold ${getScoreColor(dimension.score)}`}>
                        {dimension.score || 0}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-neutral-silver rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(dimension.score)}`}
                      style={{ width: `${dimension.score || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Footer */}
          <div className="mt-8">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-2-medium text-neutral-black mb-1">
                      Want to improve your score?
                    </p>
                    <p className="text-body-3 text-neutral-grey">
                      Upload an updated pitch deck to get a new assessment
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => router.push('/dashboard/startup')}
                  >
                    Upload New Deck
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
