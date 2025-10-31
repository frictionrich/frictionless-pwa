import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role') || 'startup';

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Get user to check if they have a profile
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // If no profile exists, redirect to onboarding
      if (!profile) {
        return NextResponse.redirect(new URL(`/onboarding/${role}`, request.url));
      }

      // Otherwise redirect to dashboard
      return NextResponse.redirect(new URL(`/dashboard/${profile.role}`, request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth/login', request.url));
}
