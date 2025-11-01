'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function StartupReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    async function loadExtractedData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Load the startup profile with AI-extracted data
        const { data: profile, error: profileError } = await supabase
          .from('startup_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
          setError('Could not load your profile data');
          setLoading(false);
          return;
        }

        // Initialize form with extracted data
        setFormData({
          company_name: profile.company_name || '',
          industry: profile.industry || '',
          stage: profile.stage || '',
          headquarters: profile.headquarters || '',
          funding_ask: profile.funding_ask || '',
          business_model: profile.business_model || '',
          value_proposition: profile.value_proposition || '',
          target_market: profile.target_market || '',
          team_size: profile.team_size || '',
          mrr: profile.mrr || '',
          revenue: profile.revenue || '',
          burn_rate: profile.burn_rate || '',
          runway_months: profile.runway_months || '',
          total_raised: profile.total_raised || '',
          valuation: profile.valuation || '',
          traction: profile.traction || '',
          product_status: profile.product_status || '',
          use_of_funds: profile.use_of_funds || '',
          market_size: profile.market_size || '',
          market_growth: profile.market_growth || '',
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadExtractedData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the profile with user-confirmed data
      const { error: updateError } = await supabase
        .from('startup_profiles')
        .update({
          company_name: formData.company_name,
          industry: formData.industry,
          stage: formData.stage,
          headquarters: formData.headquarters,
          funding_ask: formData.funding_ask,
          business_model: formData.business_model,
          value_proposition: formData.value_proposition,
          target_market: formData.target_market,
          team_size: formData.team_size ? parseInt(formData.team_size) : null,
          mrr: formData.mrr ? parseInt(formData.mrr) : null,
          revenue: formData.revenue ? parseInt(formData.revenue) : null,
          burn_rate: formData.burn_rate ? parseInt(formData.burn_rate) : null,
          runway_months: formData.runway_months ? parseInt(formData.runway_months) : null,
          total_raised: formData.total_raised ? parseInt(formData.total_raised) : null,
          valuation: formData.valuation ? parseInt(formData.valuation) : null,
          traction: formData.traction,
          product_status: formData.product_status,
          use_of_funds: formData.use_of_funds,
          market_size: formData.market_size,
          market_growth: formData.market_growth,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Redirect to dashboard
      router.push('/dashboard/startup');
    } catch (err: any) {
      console.error('Error saving:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-body-2 text-error mb-4">{error || 'No data found'}</p>
          <Button onClick={() => router.push('/onboarding/startup')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tint-5 to-white">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/logo.png" alt="Frictionless" width={150} height={40} />
        </div>

        <div className="mb-8">
          <h1 className="text-h2 font-semibold mb-2">
            Review Your Information
          </h1>
          <p className="text-body-2 text-neutral-grey">
            Our AI extracted the following information from your pitch deck. Please review and make any corrections before we start the matching process.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error rounded-md text-error text-body-3">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Industry/Sector"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  helperText="e.g., FinTech/AI & Big Data"
                />
                <Input
                  label="Stage"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  helperText="e.g., Pre-seed, Seed, Series A"
                />
                <Input
                  label="Headquarters"
                  name="headquarters"
                  value={formData.headquarters}
                  onChange={handleChange}
                  helperText="City, State/Country"
                />
                <Input
                  label="Funding Ask"
                  name="funding_ask"
                  value={formData.funding_ask}
                  onChange={handleChange}
                  helperText="e.g., $1M SAFE"
                />
                <Input
                  label="Product Status"
                  name="product_status"
                  value={formData.product_status}
                  onChange={handleChange}
                  helperText="e.g., MVP, Live, Scaling"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Model */}
          <Card>
            <CardHeader>
              <CardTitle>Business Model & Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Business Model
                  </label>
                  <textarea
                    name="business_model"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={3}
                    value={formData.business_model}
                    onChange={handleChange}
                    placeholder="How does your company make money?"
                  />
                </div>
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Value Proposition
                  </label>
                  <textarea
                    name="value_proposition"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={3}
                    value={formData.value_proposition}
                    onChange={handleChange}
                    placeholder="What unique value do you offer?"
                  />
                </div>
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Target Market
                  </label>
                  <textarea
                    name="target_market"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={3}
                    value={formData.target_market}
                    onChange={handleChange}
                    placeholder="Who are your target customers?"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="MRR (Monthly Recurring Revenue)"
                  name="mrr"
                  type="number"
                  value={formData.mrr}
                  onChange={handleChange}
                  helperText="In dollars"
                />
                <Input
                  label="Annual Revenue"
                  name="revenue"
                  type="number"
                  value={formData.revenue}
                  onChange={handleChange}
                  helperText="In dollars"
                />
                <Input
                  label="Monthly Burn Rate"
                  name="burn_rate"
                  type="number"
                  value={formData.burn_rate}
                  onChange={handleChange}
                  helperText="In dollars"
                />
                <Input
                  label="Runway (months)"
                  name="runway_months"
                  type="number"
                  value={formData.runway_months}
                  onChange={handleChange}
                />
                <Input
                  label="Total Raised to Date"
                  name="total_raised"
                  type="number"
                  value={formData.total_raised}
                  onChange={handleChange}
                  helperText="In dollars"
                />
                <Input
                  label="Current Valuation"
                  name="valuation"
                  type="number"
                  value={formData.valuation}
                  onChange={handleChange}
                  helperText="In dollars"
                />
              </div>
            </CardContent>
          </Card>

          {/* Market & Traction */}
          <Card>
            <CardHeader>
              <CardTitle>Market & Traction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Team Size"
                  name="team_size"
                  type="number"
                  value={formData.team_size}
                  onChange={handleChange}
                />
                <Input
                  label="Market Size"
                  name="market_size"
                  value={formData.market_size}
                  onChange={handleChange}
                  helperText="e.g., $2.3B (2024)"
                />
                <Input
                  label="Market Growth"
                  name="market_growth"
                  value={formData.market_growth}
                  onChange={handleChange}
                  helperText="e.g., growing 15% CAGR"
                />
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Traction
                  </label>
                  <textarea
                    name="traction"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={3}
                    value={formData.traction}
                    onChange={handleChange}
                    placeholder="Key metrics, user numbers, growth rates, partnerships"
                  />
                </div>
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Use of Funds
                  </label>
                  <textarea
                    name="use_of_funds"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={3}
                    value={formData.use_of_funds}
                    onChange={handleChange}
                    placeholder="How will you use the funding?"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              variant="secondary"
              size="normal"
              onClick={() => router.push('/onboarding/startup')}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="normal"
              onClick={handleSubmit}
              loading={saving}
            >
              Confirm & Start Matching
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
