'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const dynamic = 'force-dynamic';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'startup';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // TODO: Implement Google Sign Up later
  // const handleGoogleSignIn = async () => {
  //   try {
  //     const { error } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: {
  //         redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
  //       },
  //     });
  //     if (error) throw error;
  //   } catch (err: any) {
  //     setError(err.message);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions and Privacy Policy');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Redirect to onboarding
        router.push(`/onboarding/${role}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Image src="/logo.png" alt="Frictionless" width={150} height={40} />
          </div>

          {/* Role toggle */}
          <div className="flex gap-4 mb-8">
            <Link
              href="/auth/signup?role=startup"
              className={`flex-1 text-center py-2 text-body-2-medium transition-colors ${
                role === 'startup'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-grey'
              }`}
            >
              Startup
            </Link>
            <Link
              href="/auth/signup?role=investor"
              className={`flex-1 text-center py-2 text-body-2-medium transition-colors ${
                role === 'investor'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-grey'
              }`}
            >
              Investor
            </Link>
          </div>

          <h1 className="text-h2 font-semibold mb-2">
            Build your startup, friction-free.
          </h1>
          <p className="text-body-2 text-neutral-grey mb-8">
            Connect with investors and grow faster.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-error/10 border border-error rounded-md text-error text-body-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              helperText="Must be at least 8 characters"
              required
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-neutral-grey-blue rounded"
              />
              <label htmlFor="terms" className="text-body-3 text-neutral-grey">
                By creating an account you are accepting{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" variant="primary" size="normal" className="w-full" loading={loading}>
              Create Account
            </Button>

            {/* TODO: Implement Google Sign Up later */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-grey-blue"></div>
              </div>
              <div className="relative flex justify-center text-body-3">
                <span className="bg-white px-4 text-neutral-grey">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="normal"
              className="w-full"
              onClick={handleGoogleSignIn}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
              iconPosition="left"
            >
              Sign up with Google
            </Button> */}
          </form>

          <p className="mt-8 text-center text-body-3 text-neutral-grey">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>

          <p className="mt-8 text-center text-body-4 text-neutral-light-grey">
            © Frictionless {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="h-full w-full relative">
          <Image
            src={role === 'startup' ? '/startup-sidebar.png' : '/investor-sidebar.png'}
            alt={role === 'startup' ? 'Startup Onboarding' : 'Investor Onboarding'}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
