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

      // Load all startups from database
      const { data: startupsData } = await supabase
        .from('startup_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(7);

      setUser(user);
      setProfile(profile);
      setStartups(startupsData || []);
      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Calculate match percentage (placeholder - will be replaced with real matching algorithm)
  const calculateMatch = (startup: any) => {
    // Simple match calculation based on sector overlap
    // TODO: Implement full matching algorithm
    if (!profile?.focus_sectors || !startup?.sector) return 0;

    const investorSectors = profile.focus_sectors.map((s: string) => s.toLowerCase());
    const startupSectors = startup.sector.toLowerCase().split('/');

    const overlap = investorSectors.some((i: string) =>
      startupSectors.some((s: string) => i.includes(s) || s.includes(i))
    );

    return overlap ? 85 + Math.floor(Math.random() * 15) : 50 + Math.floor(Math.random() * 30);
  };

  // Calculate stats
  const startupCount = startups.length;
  const highReadinessCount = startups.filter(s => (s.readiness_score || 0) >= 75).length;

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
                <p className="text-h1 font-semibold">15</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Deployable</p>
                <p className="text-h1 font-semibold">{formatCurrency(12000000)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Avg. Readiness</p>
                <p className="text-h1 font-semibold">78%</p>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_0.8fr] gap-3 text-body-3 text-neutral-grey border-b border-neutral-silver pb-2">
                    <div>Name</div>
                    <div>Sector</div>
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
                      <div className="text-body-3 text-neutral-grey truncate">{startup.sector || 'N/A'}</div>
                      <div className="text-body-3 text-neutral-grey truncate">{startup.total_raised ? formatCurrency(startup.total_raised) : 'N/A'}</div>
                      <div className="text-body-3 text-neutral-grey truncate">{startup.readiness_score ? `${Math.round(startup.readiness_score)}%` : 'N/A'}</div>
                      <div>
                        <MatchBadge percentage={calculateMatch(startup)} />
                      </div>
                      <div>
                        <Button variant="tertiary" size="small">Connect</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Sidebar */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-neutral-silver last:border-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-3 text-neutral-black">Startup A dolor sit amet consectetur.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
