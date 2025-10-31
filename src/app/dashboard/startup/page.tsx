'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { formatCurrency } from '@/lib/utils';

export default function StartupDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load startup profile
      const { data: profile } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load matches for this startup with investor details
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          startup_id,
          investor_id,
          match_percentage,
          status,
          created_at,
          updated_at
        `)
        .eq('startup_id', user.id)
        .order('match_percentage', { ascending: false })
        .limit(7);

      // If we have matches, fetch the investor details separately
      let enrichedMatches: any[] = [];
      if (matchesData && matchesData.length > 0) {
        const investorIds = matchesData.map(m => m.investor_id);

        const { data: investorsData } = await supabase
          .from('investor_profiles')
          .select('*')
          .in('user_id', investorIds);

        // Combine matches with investor data
        enrichedMatches = matchesData.map(match => ({
          ...match,
          investor: investorsData?.find(inv => inv.user_id === match.investor_id)
        }));
      }

      if (matchesError) {
        console.error('Error loading matches:', matchesError);
      }

      setUser(user);
      setProfile(profile);
      setMatches(enrichedMatches);
      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Format ticket size
  const formatTicketSize = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (!min && max) return `Up to ${formatCurrency(max)}`;
    if (min && !max) return `From ${formatCurrency(min)}`;
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    return 'Not specified';
  };

  // Calculate stats
  const matchCount = matches.length;
  const totalPotential = matches.reduce((sum, match) => {
    const investor = match.investor as any;
    return sum + (investor?.ticket_size_max || 500000);
  }, 0);
  const readinessScore = profile?.readiness_score || 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="startup" userName={user?.user_metadata?.name} userEmail={user?.email} />

      <main className="flex-1 overflow-y-auto bg-neutral-silver">
        <div className="container max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-h2 font-semibold mb-2">
              Welcome back{profile?.company_name ? `, ${profile.company_name}` : ''}
            </h1>
            <p className="text-body-2 text-neutral-grey">
              Here's your funding journey overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Investor Matches</p>
                <p className="text-h1 font-semibold">{matchCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Potential Raise</p>
                <p className="text-h1 font-semibold">
                  {totalPotential > 0 ? formatCurrency(totalPotential) : 'N/A'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-body-3 text-neutral-grey">Readiness Score</p>
                  <Button variant="tertiary" size="small">View More</Button>
                </div>
                <p className="text-h1 font-semibold">
                  {readinessScore > 0 ? `${Math.round(readinessScore)}%` : 'Not assessed'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Funding Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Investor Matches</CardTitle>
                  <Button variant="tertiary" size="small">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-body-2 text-neutral-grey mb-4">No investor matches yet</p>
                    <p className="text-body-3 text-neutral-grey">
                      Complete your profile to get matched with investors
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-4 text-body-3 text-neutral-grey border-b border-neutral-silver pb-2">
                      <div className="col-span-2">Name</div>
                      <div>Potential Ticket</div>
                      <div>Profile Summary</div>
                      <div>Match</div>
                    </div>
                    {matches.map((match) => {
                      const investor = match.investor as any;
                      if (!investor) return null;

                      return (
                        <div key={match.id} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-neutral-silver last:border-0">
                          <div className="col-span-2">
                            <div className="flex items-center gap-3">
                              {investor.logo_url ? (
                                <img
                                  src={investor.logo_url}
                                  alt={investor.organization_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                  {investor.organization_name?.charAt(0) || '?'}
                                </div>
                              )}
                              <div>
                                <p className="text-body-2-medium text-neutral-black">
                                  {investor.organization_name || 'Unknown'}
                                </p>
                                <p className="text-body-4 text-neutral-grey">
                                  {investor.website || 'No website'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-body-3 text-neutral-grey">
                            {formatTicketSize(investor.ticket_size_min, investor.ticket_size_max)}
                          </div>
                          <div className="text-body-3 text-neutral-grey">
                            {investor.focus_sectors?.slice(0, 2).join(', ') || 'No focus specified'}
                          </div>
                          <div className="flex items-center justify-between">
                            <MatchBadge percentage={match.match_percentage} />
                            <Button variant="tertiary" size="small">Connect</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funding Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-center py-8">
                    <p className="text-body-2 text-neutral-grey mb-2">
                      Funding tracking coming soon
                    </p>
                    <p className="text-body-3 text-neutral-grey">
                      Track your raise progress and milestones
                    </p>
                  </div>
                  <div className="space-y-2 text-left border-t border-neutral-silver pt-4">
                    <div className="flex justify-between">
                      <span className="text-body-3 text-neutral-grey">Potential:</span>
                      <span className="text-body-3-medium">
                        {totalPotential > 0 ? formatCurrency(totalPotential) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-3 text-neutral-grey">Investors:</span>
                      <span className="text-body-3-medium">{matchCount}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-silver pt-4">
                  <h4 className="text-body-2-medium mb-3">Next Steps</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-tint-5 rounded-lg border border-tint-3">
                      <span className="text-xl">✨</span>
                      <div className="flex-1">
                        <p className="text-body-3-medium text-neutral-black">Improve Readiness</p>
                        <p className="text-body-4 text-neutral-grey">Build the confidence investors trust.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-neutral-silver rounded-lg">
                      <span className="text-xl">🔓</span>
                      <div className="flex-1">
                        <p className="text-body-3-medium text-neutral-black">Unlock Intros</p>
                        <p className="text-body-4 text-neutral-grey">Your progress unlocks investor access.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-neutral-silver rounded-lg">
                      <span className="text-xl">👥</span>
                      <div className="flex-1">
                        <p className="text-body-3-medium text-neutral-black">View Dealroom</p>
                        <p className="text-body-4 text-neutral-grey">Manage your active investor pipeline.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Views Stats */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-h3 font-semibold">0</span>
                <span className="text-body-2 text-neutral-grey">Profile Views</span>
                <span className="text-body-3 text-neutral-grey">Analytics coming soon</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
