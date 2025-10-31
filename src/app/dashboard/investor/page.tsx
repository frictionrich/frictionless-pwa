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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Mock data for demonstration
  const startups = [
    { id: 1, name: 'Ephemeral', website: 'ephemeral.io', roi: '4.5x', raised: '500k', readiness: 96, match: 92 },
    { id: 2, name: 'Stack3d Lab', website: 'stack3dlab.com', roi: '4.5x', raised: '500k', readiness: 96, match: 92 },
    { id: 3, name: 'Warpspeed', website: 'getwarpspeed.com', roi: '4.5x', raised: '500k', readiness: 96, match: 92 },
    { id: 4, name: 'CloudWatch', website: 'cloudwatch.app', roi: '4.5x', raised: '500k', readiness: 96, match: 92 },
    { id: 5, name: 'ContrastAI', website: 'contrastai.com', roi: '4.5x', raised: '500k', readiness: 96, match: 92 },
    { id: 6, name: 'Convergence', website: 'convergence.io', roi: '4.5x', raised: '500k', readiness: 96, match: 92 },
    { id: 7, name: 'Sisyphus', website: 'sisyphus.com', roi: '4.5x', raised: '500k', readiness: 96, match: 92 },
  ];

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
                  <Button variant="tertiary" size="small">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 text-body-3 text-neutral-grey border-b border-neutral-silver pb-2">
                    <div className="col-span-2">Name</div>
                    <div>ROI</div>
                    <div>Raised</div>
                    <div>Readiness Score</div>
                    <div>Match</div>
                  </div>
                  {startups.map((startup) => (
                    <div key={startup.id} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-neutral-silver last:border-0">
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {startup.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-body-2-medium text-neutral-black">{startup.name}</p>
                            <p className="text-body-4 text-neutral-grey">{startup.website}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-body-3 text-neutral-grey">{startup.roi}</div>
                      <div className="text-body-3 text-neutral-grey">{startup.raised}</div>
                      <div className="text-body-3 text-neutral-grey">{startup.readiness}%</div>
                      <div className="flex items-center justify-between">
                        <MatchBadge percentage={startup.match} />
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
