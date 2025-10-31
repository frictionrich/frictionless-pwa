'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // User is authenticated, fetch their profile to determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'startup') {
          router.push('/dashboard/startup');
        } else if (profile?.role === 'investor') {
          router.push('/dashboard/investor');
        } else {
          // No profile yet, let them see the landing page
          setLoading(false);
        }
      } else {
        // Not authenticated, show landing page
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tint-5 to-white">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-body-2 text-neutral-grey">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tint-5 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-h1 font-semibold mb-6 text-neutral-black">
          Frictionless
        </h1>
        <p className="text-h3 mb-8 text-neutral-dark-grey">
          Startup Funding, Reimagined
        </p>
        <p className="text-body-1 mb-12 text-neutral-grey max-w-2xl mx-auto">
          Instant Alignment for Founders and Investors. Matched. Measured. Monitored.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/signup?role=startup" className="btn btn-primary btn-normal">
            I'm a Startup
          </Link>
          <Link href="/auth/signup?role=investor" className="btn btn-secondary btn-normal">
            I'm an Investor
          </Link>
        </div>
      </div>
    </main>
  );
}
