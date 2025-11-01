'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function InvestorReviewPage() {
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

        // Load the investor profile with AI-extracted data
        const { data: profile, error: profileError } = await supabase
          .from('investor_profiles')
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
          organization_name: profile.organization_name || '',
          investor_name: profile.investor_name || '',
          headquarters: profile.headquarters || '',
          fund_size: profile.fund_size || '',
          average_ticket: profile.average_ticket || '',
          investment_thesis: profile.investment_thesis || '',
          value_add: profile.value_add || '',
          decision_process: profile.decision_process || '',
          timeline: profile.timeline || '',
          focus_sectors: profile.focus_sectors || [],
          focus_stages: profile.focus_stages || [],
          geography_focus: profile.geography_focus || [],
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

  const handleArrayChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: items });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the profile with user-confirmed data
      const { error: updateError } = await supabase
        .from('investor_profiles')
        .update({
          organization_name: formData.organization_name,
          investor_name: formData.investor_name,
          headquarters: formData.headquarters,
          fund_size: formData.fund_size,
          average_ticket: formData.average_ticket,
          investment_thesis: formData.investment_thesis,
          value_add: formData.value_add,
          decision_process: formData.decision_process,
          timeline: formData.timeline,
          focus_sectors: formData.focus_sectors,
          focus_stages: formData.focus_stages,
          geography_focus: formData.geography_focus,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Redirect to dashboard
      router.push('/dashboard/investor');
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
          <Button onClick={() => router.push('/onboarding/investor')}>Go Back</Button>
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
            Our AI extracted the following information from your investor deck. Please review and make any corrections before we start the matching process.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error rounded-md text-error text-body-3">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Organization/Fund Name"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Investor Name (Individual)"
                  name="investor_name"
                  value={formData.investor_name}
                  onChange={handleChange}
                  helperText="If applicable"
                />
                <Input
                  label="Headquarters"
                  name="headquarters"
                  value={formData.headquarters}
                  onChange={handleChange}
                  helperText="City, State/Country"
                />
                <Input
                  label="Fund Size"
                  name="fund_size"
                  value={formData.fund_size}
                  onChange={handleChange}
                  helperText="e.g., $50M or Angel Investor"
                />
                <Input
                  label="Average Ticket Size"
                  name="average_ticket"
                  value={formData.average_ticket}
                  onChange={handleChange}
                  helperText="e.g., $25K-$150K"
                />
                <Input
                  label="Decision Timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  helperText="e.g., 4-8 weeks"
                />
              </div>
            </CardContent>
          </Card>

          {/* Investment Focus */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Focus Sectors
                  </label>
                  <Input
                    name="focus_sectors"
                    value={formData.focus_sectors.join(', ')}
                    onChange={(e) => handleArrayChange('focus_sectors', e.target.value)}
                    helperText="Comma-separated (e.g., SaaS, AI/ML, FinTech)"
                  />
                </div>
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Focus Stages
                  </label>
                  <Input
                    name="focus_stages"
                    value={formData.focus_stages.join(', ')}
                    onChange={(e) => handleArrayChange('focus_stages', e.target.value)}
                    helperText="Comma-separated (e.g., Pre-seed, Seed, Series A)"
                  />
                </div>
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Geographic Focus
                  </label>
                  <Input
                    name="geography_focus"
                    value={formData.geography_focus.join(', ')}
                    onChange={(e) => handleArrayChange('geography_focus', e.target.value)}
                    helperText="Comma-separated (e.g., Texas, LATAM, US)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Philosophy */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Philosophy & Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Investment Thesis
                  </label>
                  <textarea
                    name="investment_thesis"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={4}
                    value={formData.investment_thesis}
                    onChange={handleChange}
                    placeholder="Your investment philosophy and approach..."
                  />
                </div>
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Value Add
                  </label>
                  <textarea
                    name="value_add"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={3}
                    value={formData.value_add}
                    onChange={handleChange}
                    placeholder="How you help portfolio companies beyond capital..."
                  />
                </div>
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Decision Process
                  </label>
                  <textarea
                    name="decision_process"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={3}
                    value={formData.decision_process}
                    onChange={handleChange}
                    placeholder="How you make investment decisions..."
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
              onClick={() => router.push('/onboarding/investor')}
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
