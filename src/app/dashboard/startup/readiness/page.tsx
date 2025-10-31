'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/Card';

export default function ReadinessPage() {
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
            <h1 className="text-h2 font-semibold mb-2">Readiness Assessment</h1>
            <p className="text-body-2 text-neutral-grey">
              Understand your investment readiness and get actionable recommendations
            </p>
          </div>

          <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-neutral-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-h3 font-semibold mb-3">Readiness Assessment Coming Soon</h2>
            <p className="text-body-2 text-neutral-grey mb-6 max-w-md mx-auto">
              Get a comprehensive assessment of your startup's investment readiness based on the Frictionless Intelligence framework.
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto bg-tint-5 rounded-lg p-6 border border-tint-3">
              <p className="text-body-3-medium text-neutral-black mb-3">What's coming:</p>
              <ul className="space-y-2 text-body-3 text-neutral-grey">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Overall readiness score (0-100) with breakdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Category scores: Formation, Business Plan, Pitch, Product, Technology, Go-To-Market</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Detailed recommendations with priority and impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Action items checklist to improve your score</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Progress tracking over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Comparison with successful funded companies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>AI-powered insights from your pitch deck analysis</span>
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
