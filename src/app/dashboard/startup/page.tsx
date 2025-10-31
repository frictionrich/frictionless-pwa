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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUser(user);
      setProfile(profile);
      setLoading(false);
    }

    loadUser();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Mock data for demonstration
  const investors = [
    { id: 1, name: 'Ephemeral', website: 'ephemeral.io', potentialTicket: '$500K - $1M', match: 92 },
    { id: 2, name: 'Stack3d Lab', website: 'stack3dlab.com', potentialTicket: '$500K - $1M', match: 92 },
    { id: 3, name: 'Warpspeed', website: 'getwarpspeed.com', potentialTicket: '$500K - $1M', match: 92 },
    { id: 4, name: 'CloudWatch', website: 'cloudwatch.app', potentialTicket: '$500K - $1M', match: 92 },
    { id: 5, name: 'ContrastAI', website: 'contrastai.com', potentialTicket: '$500K - $1M', match: 65 },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="startup" userName={user?.user_metadata?.name} userEmail={user?.email} />

      <main className="flex-1 overflow-y-auto bg-neutral-silver">
        <div className="container max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-h2 font-semibold mb-2">
              Welcome back, {user?.user_metadata?.name || 'there'}
            </h1>
            <p className="text-body-2 text-neutral-grey">
              Here's your funding journey overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Investors Matches</p>
                <p className="text-h1 font-semibold">12</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Potential Raise</p>
                <p className="text-h1 font-semibold">{formatCurrency(8500000)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-body-3 text-neutral-grey">Readiness Score</p>
                  <Button variant="tertiary" size="small">View More</Button>
                </div>
                <p className="text-h1 font-semibold">75%</p>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 text-body-3 text-neutral-grey border-b border-neutral-silver pb-2">
                    <div className="col-span-2">Name</div>
                    <div>Potential Ticket</div>
                    <div>Profile Summary</div>
                    <div>Match</div>
                  </div>
                  {investors.map((investor) => (
                    <div key={investor.id} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-neutral-silver last:border-0">
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {investor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-body-2-medium text-neutral-black">{investor.name}</p>
                            <p className="text-body-4 text-neutral-grey">{investor.website}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-body-3 text-neutral-grey">{investor.potentialTicket}</div>
                      <div className="text-body-3 text-neutral-grey">Profile & Investment Focus</div>
                      <div className="flex items-center justify-between">
                        <MatchBadge percentage={investor.match} />
                        <Button variant="tertiary" size="small">Connect</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funding Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-48 h-48 mb-4">
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        className="text-neutral-silver"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - 1.75 / 8.5)}`}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute">
                      <p className="text-h2 font-semibold">{formatCurrency(1750000)}</p>
                      <p className="text-body-3 text-neutral-grey">Raised</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-body-3 text-neutral-grey">Goal:</span>
                      <span className="text-body-3-medium">{formatCurrency(2000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-3 text-neutral-grey">Potential:</span>
                      <span className="text-body-3-medium">{formatCurrency(8500000)}</span>
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
                <span className="text-h3 font-semibold">24</span>
                <span className="text-body-2 text-neutral-grey">Views</span>
                <span className="text-body-3 text-success">+10% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
