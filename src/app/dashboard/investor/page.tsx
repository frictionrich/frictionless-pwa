'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { formatCurrency } from '@/lib/utils';

export default function InvestorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllStartups, setShowAllStartups] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load investor profile
      const { data: profile } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load matched startups for this investor
      // Join matches table with startup_profiles to only get startups with matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          match_percentage,
          startup_id,
          startup_profiles!matches_startup_id_fkey (
            id,
            user_id,
            company_name,
            website,
            industry,
            total_raised,
            created_at
          )
        `)
        .eq('investor_id', user.id)
        .order('match_percentage', { ascending: false });

      // Get readiness scores for all matched startups
      let startupsWithMatches: any[] = [];
      if (matchesData && matchesData.length > 0) {
        const startupIds = matchesData.map(m => m.startup_id);

        // Fetch the most recent readiness assessment for each startup
        const { data: assessments } = await supabase
          .from('readiness_assessments')
          .select('startup_id, overall_score, created_at')
          .in('startup_id', startupIds);

        // For each startup, find their most recent assessment
        const assessmentMap = new Map();
        assessments?.forEach(assessment => {
          const existing = assessmentMap.get(assessment.startup_id);
          if (!existing || new Date(assessment.created_at) > new Date(existing.created_at)) {
            assessmentMap.set(assessment.startup_id, assessment);
          }
        });

        // Flatten the data to include match_percentage and readiness_score with startup data
        startupsWithMatches = matchesData.map(match => ({
          ...match.startup_profiles,
          match_percentage: match.match_percentage,
          readiness_score: assessmentMap.get(match.startup_id)?.overall_score || null
        }));
      }

      setUser(user);
      setProfile(profile);
      setStartups(startupsWithMatches);
      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Get match percentage from the startup data (already fetched from matches table)
  const getMatchPercentage = (startup: any) => {
    return startup.match_percentage || 0;
  };

  // Calculate real stats from data
  const startupCount = startups.length;
  const totalDeployable = profile?.ticket_size_max || 0;
  const avgReadiness = startups.length > 0
    ? Math.round(startups.reduce((sum, s) => sum + (s.readiness_score || 0), 0) / startups.length)
    : 0;

  // Determine which startups to display
  const displayedStartups = showAllStartups ? startups : startups.slice(0, 3);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="investor" userName={user?.user_metadata?.name} userEmail={user?.email} />

      <main className="flex-1 overflow-y-auto bg-neutral-silver">
        <div className="container max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-h2 font-semibold mb-2">
                Welcome back, {user?.user_metadata?.name || 'there'}
              </h1>
              <p className="text-body-2 text-neutral-grey">
                Here's your deal flow overview
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center cursor-pointer hover:bg-error/20 transition-colors">
              <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Startup Matches</p>
                <p className="text-h1 font-semibold">{startupCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Max Ticket Size</p>
                <p className="text-h1 font-semibold">
                  {totalDeployable > 0 ? formatCurrency(totalDeployable) : 'Not set'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Avg. Readiness</p>
                <p className="text-h1 font-semibold">
                  {avgReadiness > 0 ? `${avgReadiness}%` : 'No data'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Startup Matches Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Startup Matches</CardTitle>
                  {!showAllStartups && startups.length > 3 && (
                    <Button
                      variant="tertiary"
                      size="small"
                      onClick={() => setShowAllStartups(true)}
                    >
                      View All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {startups.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-neutral-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-body-2 text-neutral-grey mb-2">No startup matches yet</p>
                    <p className="text-body-3 text-neutral-light-grey">
                      Startups will appear here as they join the platform
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_0.8fr] gap-3 text-body-3 text-neutral-grey border-b border-neutral-silver pb-2">
                      <div>Name</div>
                      <div>Industry</div>
                      <div>Raised</div>
                      <div>Readiness Score</div>
                      <div>Match</div>
                      <div></div>
                    </div>
                    {displayedStartups.map((startup) => (
                      <div key={startup.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_0.8fr] gap-3 items-center py-3 border-b border-neutral-silver last:border-0">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                              {startup.company_name?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-body-2-medium text-neutral-black truncate">{startup.company_name || 'Unknown Company'}</p>
                              <p className="text-body-4 text-neutral-grey truncate">{startup.website || 'No website'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-body-3 text-neutral-grey truncate">{startup.industry || 'N/A'}</div>
                        <div className="text-body-3 text-neutral-grey truncate">{startup.total_raised ? formatCurrency(startup.total_raised) : 'N/A'}</div>
                        <div className="text-body-3 text-neutral-grey truncate">{startup.readiness_score ? `${Math.round(startup.readiness_score)}%` : 'N/A'}</div>
                        <div>
                          <MatchBadge percentage={getMatchPercentage(startup)} />
                        </div>
                        <div>
                          <Button variant="tertiary" size="small">Connect</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-body-2 text-neutral-grey">No recent activity</p>
                  <p className="text-body-3 text-neutral-light-grey mt-2">
                    Activity will appear here when you interact with startups
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
