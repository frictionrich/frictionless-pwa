'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/Card';

export default function InvestorsPage() {
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="startup" userName={user?.user_metadata?.name} userEmail={user?.email} />

      <main className="flex-1 overflow-y-auto bg-neutral-silver">
        <div className="container max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-h2 font-semibold mb-2">Investors</h1>
            <p className="text-body-2 text-neutral-grey">
              Browse and connect with investors that match your startup
            </p>
          </div>

          <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-neutral-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-h3 font-semibold mb-3">Investor Network Coming Soon</h2>
            <p className="text-body-2 text-neutral-grey mb-6 max-w-md mx-auto">
              We're building a comprehensive investor directory with advanced matching, filtering, and connection features.
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto bg-tint-5 rounded-lg p-6 border border-tint-3">
              <p className="text-body-3-medium text-neutral-black mb-3">What's coming:</p>
              <ul className="space-y-2 text-body-3 text-neutral-grey">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Complete investor profiles with thesis and portfolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>AI-powered matching based on sector, stage, and geography</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Direct messaging and warm introductions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Application tracking and status updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Advanced filters by sector, stage, ticket size, and more</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </main>
    </div>
  );
}
