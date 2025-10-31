'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-tint-5 to-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Frictionless" width={150} height={40} className="mx-auto" />
        </div>

        <div className="card">
          <h1 className="text-h3 font-semibold mb-2">
            Forgot Password?
          </h1>
          <p className="text-body-2 text-neutral-grey mb-6">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-error/10 border border-error rounded-md text-error text-body-3">
              {error}
            </div>
          )}

          {success ? (
            <div className="mb-4 p-4 bg-success/10 border border-success rounded-md text-success text-body-3">
              Check your email for password reset instructions.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="normal" className="w-full" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-body-3 text-neutral-grey">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-body-4 text-neutral-light-grey">
          © Frictionless {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
