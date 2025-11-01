'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function InvestorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    investorDeckFile: null as File | null,
    focusSectors: [] as string[],
    focusStages: [] as string[],
    ticketSizeMin: '',
    ticketSizeMax: '',
  });

  // Review data state (populated after AI analysis)
  const [reviewData, setReviewData] = useState<any>(null);

  const sectors = ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'AI/ML', 'Blockchain', 'Climate Tech'];
  const stages = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReviewData({ ...reviewData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setReviewData({ ...reviewData, [field]: items });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes

      if (file.size > maxSize) {
        setError('File size exceeds 4.5MB limit. Please upload a smaller file.');
        return;
      }

      setError(''); // Clear any previous errors
      setFormData({ ...formData, investorDeckFile: file });
    }
  };

  const toggleSector = (sector: string) => {
    setFormData({
      ...formData,
      focusSectors: formData.focusSectors.includes(sector)
        ? formData.focusSectors.filter(s => s !== sector)
        : [...formData.focusSectors, sector],
    });
  };

  const toggleStage = (stage: string) => {
    setFormData({
      ...formData,
      focusStages: formData.focusStages.includes(stage)
        ? formData.focusStages.filter(s => s !== stage)
        : [...formData.focusStages, stage],
    });
  };

  // Handle step 2 -> 3: Upload and analyze investor deck
  const handleUploadAndAnalyze = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let investorDeckUrl = null;
      let analysis = null;

      if (formData.investorDeckFile) {
        // Upload file
        console.log('Uploading investor deck...');
        const fileExt = formData.investorDeckFile.name.split('.').pop();
        const fileName = `${user.id}/investor-deck-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('investor-decks')
          .upload(fileName, formData.investorDeckFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        console.log('File uploaded successfully');

        const { data: { publicUrl } } = supabase.storage
          .from('investor-decks')
          .getPublicUrl(fileName);

        investorDeckUrl = publicUrl;

        // Analyze investor deck with AI if it's a PDF
        if (fileExt?.toLowerCase() === 'pdf') {
          try {
            console.log('Starting AI analysis...');

            const formDataToSend = new FormData();
            formDataToSend.append('file', formData.investorDeckFile as File);

            console.log('Calling API with PDF file...');
            const analysisResponse = await fetch('/api/analyze-investor-deck', {
              method: 'POST',
              body: formDataToSend,
            });

            console.log('API response status:', analysisResponse.status);
            if (analysisResponse.ok) {
              const result = await analysisResponse.json();
              analysis = result.analysis;
              console.log('Analysis result:', analysis);
            } else {
              const errorData = await analysisResponse.json().catch(() => ({ error: 'Could not parse error response' }));
              console.error('AI analysis failed with status:', analysisResponse.status);
              console.error('Error details:', errorData);
            }
          } catch (analysisError) {
            console.error('AI analysis failed:', analysisError);
            // Continue without analysis - not critical
          }
        }
      }

      // Create or update investor profile with AI-extracted data
      const profileData = {
        user_id: user.id,
        organization_name: analysis?.fund_name || formData.organizationName,
        investor_name: analysis?.investor_name || null,
        website: formData.website,
        investor_deck_url: investorDeckUrl,
        headquarters: analysis?.headquarters || null,
        fund_size: analysis?.fund_size || null,
        average_ticket: analysis?.average_ticket || null,
        focus_sectors: analysis?.sector_focus?.length > 0 ? analysis.sector_focus : formData.focusSectors,
        focus_stages: analysis?.stage_focus?.length > 0 ? analysis.stage_focus : formData.focusStages,
        geography_focus: analysis?.geography_focus || null,
        ticket_size_min: formData.ticketSizeMin ? parseInt(formData.ticketSizeMin) : null,
        ticket_size_max: formData.ticketSizeMax ? parseInt(formData.ticketSizeMax) : null,
        investment_thesis: analysis?.investment_thesis || null,
        portfolio_highlights: analysis?.portfolio_highlights || null,
        investment_criteria: analysis?.investment_criteria || null,
        value_add: analysis?.value_add || null,
        decision_process: analysis?.decision_process || null,
        timeline: analysis?.timeline || null,
        frictionless_insights: analysis?.frictionless_insights || null,
        ai_analyzed_at: analysis ? new Date().toISOString() : null,
      };

      console.log('Upserting investor profile with data:', profileData);

      const { data: upsertData, error: investorError } = await supabase
        .from('investor_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select();

      console.log('Upsert result:', { data: upsertData, error: investorError });

      if (investorError) {
        console.error('Investor profile upsert error:', investorError);
        throw investorError;
      }

      console.log('Investor profile created successfully!');

      // Load the created profile to populate review form
      const { data: profile, error: profileError } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        throw profileError;
      }

      // Initialize review data with extracted data
      setReviewData({
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

      // Move to step 3 (review)
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle final submit: Save reviewed data and go to dashboard
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the profile with user-confirmed data
      const { error: updateError } = await supabase
        .from('investor_profiles')
        .update({
          organization_name: reviewData.organization_name,
          investor_name: reviewData.investor_name,
          headquarters: reviewData.headquarters,
          fund_size: reviewData.fund_size,
          average_ticket: reviewData.average_ticket,
          investment_thesis: reviewData.investment_thesis,
          value_add: reviewData.value_add,
          decision_process: reviewData.decision_process,
          timeline: reviewData.timeline,
          focus_sectors: reviewData.focus_sectors,
          focus_stages: reviewData.focus_stages,
          geography_focus: reviewData.geography_focus,
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tint-5 to-white">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/logo.png" alt="Frictionless" width={150} height={40} />
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-3 text-neutral-grey">Step {step} of 3</span>
            <span className="text-body-3 text-neutral-grey">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-neutral-silver rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="card max-w-2xl mx-auto">
          {step === 1 && (
            <>
              <h1 className="text-h2 font-semibold mb-2">
                Tell us about your organization
              </h1>
              <p className="text-body-2 text-neutral-grey mb-8">
                We'll use this information to create your profile and match you with the right startups.
              </p>

              {error && (
                <div className="mb-4 p-4 bg-error/10 border border-error rounded-md text-error text-body-3">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Organization Name"
                  name="organizationName"
                  type="text"
                  placeholder="Enter your organization name"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Website"
                  name="website"
                  type="url"
                  placeholder="https://yourfund.com"
                  value={formData.website}
                  onChange={handleChange}
                />

                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    variant="primary"
                    size="normal"
                    onClick={() => setStep(2)}
                    disabled={!formData.organizationName}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-h2 font-semibold mb-2">
                Define your investment thesis
              </h1>
              <p className="text-body-2 text-neutral-grey mb-8">
                Help us understand your investment preferences to match you with relevant startups.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-3">
                    Focus Sectors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sectors.map((sector) => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => toggleSector(sector)}
                        className={`px-4 py-2 rounded-md border text-body-3 transition-colors ${
                          formData.focusSectors.includes(sector)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-neutral-grey border-neutral-grey-blue hover:border-primary'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-3">
                    Focus Stages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {stages.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => toggleStage(stage)}
                        className={`px-4 py-2 rounded-md border text-body-3 transition-colors ${
                          formData.focusStages.includes(stage)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-neutral-grey border-neutral-grey-blue hover:border-primary'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min Ticket Size ($)"
                    name="ticketSizeMin"
                    type="number"
                    placeholder="50000"
                    value={formData.ticketSizeMin}
                    onChange={handleChange}
                  />
                  <Input
                    label="Max Ticket Size ($)"
                    name="ticketSizeMax"
                    type="number"
                    placeholder="1000000"
                    value={formData.ticketSizeMax}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex justify-between gap-4 mt-8">
                  <Button
                    variant="secondary"
                    size="normal"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="normal"
                    onClick={handleUploadAndAnalyze}
                    loading={loading}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && reviewData && (
            <div className="max-w-5xl mx-auto">
              <h1 className="text-h2 font-semibold mb-2">
                Review Your Information
              </h1>
              <p className="text-body-2 text-neutral-grey mb-8">
                Our AI extracted the following information from your investor deck. Please review and make any corrections before we start the matching process.
              </p>

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
                        value={reviewData.organization_name}
                        onChange={handleReviewChange}
                        required
                      />
                      <Input
                        label="Investor Name (Individual)"
                        name="investor_name"
                        value={reviewData.investor_name}
                        onChange={handleReviewChange}
                        helperText="If applicable"
                      />
                      <Input
                        label="Headquarters"
                        name="headquarters"
                        value={reviewData.headquarters}
                        onChange={handleReviewChange}
                        helperText="City, State/Country"
                      />
                      <Input
                        label="Fund Size"
                        name="fund_size"
                        value={reviewData.fund_size}
                        onChange={handleReviewChange}
                        helperText="e.g., $50M or Angel Investor"
                      />
                      <Input
                        label="Average Ticket Size"
                        name="average_ticket"
                        value={reviewData.average_ticket}
                        onChange={handleReviewChange}
                        helperText="e.g., $25K-$150K"
                      />
                      <Input
                        label="Decision Timeline"
                        name="timeline"
                        value={reviewData.timeline}
                        onChange={handleReviewChange}
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
                          value={reviewData.focus_sectors.join(', ')}
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
                          value={reviewData.focus_stages.join(', ')}
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
                          value={reviewData.geography_focus.join(', ')}
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
                          value={reviewData.investment_thesis}
                          onChange={handleReviewChange}
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
                          value={reviewData.value_add}
                          onChange={handleReviewChange}
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
                          value={reviewData.decision_process}
                          onChange={handleReviewChange}
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
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="normal"
                    onClick={handleSubmit}
                    loading={loading}
                  >
                    Confirm & Start Matching
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
