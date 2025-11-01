'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function StartupOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Now step 1 = upload deck, step 2 = review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    linkedin: '',
    twitter: '',
    pitchDeckFile: null as File | null,
  });

  // Review data state (populated after AI analysis)
  const [reviewData, setReviewData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReviewData({ ...reviewData, [e.target.name]: e.target.value });
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
      setFormData({ ...formData, pitchDeckFile: file });
    }
  };

  // Handle step 2 -> 3: Upload and analyze pitch deck
  const handleUploadAndAnalyze = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let pitchDeckUrl = null;
      let analysis = null;

      if (formData.pitchDeckFile) {
        // Upload file
        const fileExt = formData.pitchDeckFile.name.split('.').pop();
        const fileName = `${user.id}/pitch-deck-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('pitch-decks')
          .upload(fileName, formData.pitchDeckFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pitch-decks')
          .getPublicUrl(fileName);

        pitchDeckUrl = publicUrl;

        // Analyze pitch deck with AI if it's a PDF
        if (fileExt?.toLowerCase() === 'pdf') {
          try {
            const formDataToSend = new FormData();
            formDataToSend.append('file', formData.pitchDeckFile as File);

            const analysisResponse = await fetch('/api/analyze-pitch-deck', {
              method: 'POST',
              body: formDataToSend,
            });

            if (analysisResponse.ok) {
              const result = await analysisResponse.json();
              analysis = result.analysis;
            } else {
              console.error('AI analysis failed with status:', analysisResponse.status);
            }
          } catch (analysisError) {
            console.error('AI analysis failed:', analysisError);
            // Continue without analysis - not critical
          }
        }
      }

      // Create or update startup profile with AI-extracted data using upsert
      const { error: startupError } = await supabase
        .from('startup_profiles')
        .upsert({
          user_id: user.id,
          company_name: analysis?.company_name || formData.companyName,
          website: formData.website,
          pitch_deck_url: pitchDeckUrl,
          description: analysis?.value_proposition || analysis?.business_model || null,
          industry: analysis?.industry || null,
          stage: analysis?.stage || null,
        }, {
          onConflict: 'user_id'
        });

      if (startupError) {
        console.error('Startup profile error:', startupError);
        throw startupError;
      }

      // Store readiness assessment if AI analysis was performed
      if (analysis?.readiness_assessment && pitchDeckUrl) {
        const assessmentData = {
          startup_id: user.id,
          pitch_deck_path: pitchDeckUrl,
          overall_score: analysis.readiness_assessment.overall_score ? parseFloat(analysis.readiness_assessment.overall_score) : null,
          formation: analysis.readiness_assessment.formation ? parseFloat(analysis.readiness_assessment.formation) : null,
          business_plan: analysis.readiness_assessment.business_plan ? parseFloat(analysis.readiness_assessment.business_plan) : null,
          pitch: analysis.readiness_assessment.pitch ? parseFloat(analysis.readiness_assessment.pitch) : null,
          product: analysis.readiness_assessment.product ? parseFloat(analysis.readiness_assessment.product) : null,
          technology: analysis.readiness_assessment.technology ? parseFloat(analysis.readiness_assessment.technology) : null,
          go_to_market: analysis.readiness_assessment.go_to_market ? parseFloat(analysis.readiness_assessment.go_to_market) : null,
        };

        const { error: assessmentError } = await supabase
          .from('readiness_assessments')
          .upsert(assessmentData, {
            onConflict: 'startup_id,pitch_deck_path'
          });

        if (assessmentError) {
          console.error('Readiness assessment error:', assessmentError);
          // Don't throw - this is not critical, continue with onboarding
        }
      }

      // Load the created profile to populate review form
      const { data: profile, error: profileError } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        throw profileError;
      }

      // Initialize review data with extracted data
      setReviewData({
        company_name: profile.company_name || '',
        website: profile.website || '',
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

      // Move to step 2 (review)
      setStep(2);
    } catch (err: any) {
      console.error('Error in handleUploadAndAnalyze:', err);
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
        .from('startup_profiles')
        .update({
          company_name: reviewData.company_name,
          website: reviewData.website,
          industry: reviewData.industry,
          stage: reviewData.stage,
          headquarters: reviewData.headquarters,
          funding_ask: reviewData.funding_ask,
          business_model: reviewData.business_model,
          value_proposition: reviewData.value_proposition,
          target_market: reviewData.target_market,
          team_size: reviewData.team_size ? parseInt(reviewData.team_size) : null,
          mrr: reviewData.mrr ? parseInt(reviewData.mrr) : null,
          revenue: reviewData.revenue ? parseInt(reviewData.revenue) : null,
          burn_rate: reviewData.burn_rate ? parseInt(reviewData.burn_rate) : null,
          runway_months: reviewData.runway_months ? parseInt(reviewData.runway_months) : null,
          total_raised: reviewData.total_raised ? parseInt(reviewData.total_raised) : null,
          valuation: reviewData.valuation ? parseInt(reviewData.valuation) : null,
          traction: reviewData.traction,
          product_status: reviewData.product_status,
          use_of_funds: reviewData.use_of_funds,
          market_size: reviewData.market_size,
          market_growth: reviewData.market_growth,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Calculate matches with all investors
      try {
        await fetch('/api/calculate-matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startup_id: user.id }),
        });
      } catch (matchError) {
        console.error('Error calculating matches:', matchError);
        // Don't block redirect if matching fails
      }

      // Redirect to dashboard
      router.push('/dashboard/startup');
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
            <span className="text-body-3 text-neutral-grey">Step {step} of 2</span>
            <span className="text-body-3 text-neutral-grey">{Math.round((step / 2) * 100)}%</span>
          </div>
          <div className="h-2 bg-neutral-silver rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="card max-w-2xl mx-auto">
          {step === 1 && (
            <>
              <h1 className="text-h2 font-semibold mb-2">
                Upload your pitch deck
              </h1>
              <p className="text-body-2 text-neutral-grey mb-8">
                Our AI will extract key information to help create your profile and assess investment readiness.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Pitch Deck (PDF, PPT, or PPTX)
                  </label>
                  <div className="border-2 border-dashed border-neutral-grey-blue rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pitch-deck"
                    />
                    <label htmlFor="pitch-deck" className="cursor-pointer">
                      {formData.pitchDeckFile ? (
                        <div>
                          <p className="text-body-2 text-neutral-black mb-2">
                            {formData.pitchDeckFile.name}
                          </p>
                          <p className="text-body-3 text-primary">
                            Click to change file
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-4">
                            <svg className="w-12 h-12 mx-auto text-neutral-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className="text-body-2 text-neutral-black mb-2">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-body-3 text-neutral-grey">
                            PDF, PPT, or PPTX (max 4.5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-tint-5 border border-tint-3 rounded-lg p-4">
                  <p className="text-body-3 text-neutral-grey">
                    💡 Our AI will automatically extract company information, team details, traction metrics, and more from your pitch deck to create a comprehensive profile.
                  </p>
                </div>

                <div className="flex justify-end gap-4 mt-8">
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

          {step === 2 && reviewData && (
            <div className="max-w-5xl mx-auto">
              <h1 className="text-h2 font-semibold mb-2">
                Review Your Information
              </h1>
              <p className="text-body-2 text-neutral-grey mb-8">
                Our AI extracted the following information from your pitch deck. Please review and make any corrections before we start the matching process.
              </p>

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
                        value={reviewData.company_name}
                        onChange={handleReviewChange}
                        required
                      />
                      <Input
                        label="Website"
                        name="website"
                        type="url"
                        value={reviewData.website}
                        onChange={handleReviewChange}
                        helperText="e.g., https://yourcompany.com"
                      />
                      <Input
                        label="Industry/Sector"
                        name="industry"
                        value={reviewData.industry}
                        onChange={handleReviewChange}
                        helperText="e.g., FinTech/AI & Big Data"
                      />
                      <Input
                        label="Stage"
                        name="stage"
                        value={reviewData.stage}
                        onChange={handleReviewChange}
                        helperText="e.g., Pre-seed, Seed, Series A"
                      />
                      <Input
                        label="Headquarters"
                        name="headquarters"
                        value={reviewData.headquarters}
                        onChange={handleReviewChange}
                        helperText="City, State/Country"
                      />
                      <Input
                        label="Funding Ask"
                        name="funding_ask"
                        value={reviewData.funding_ask}
                        onChange={handleReviewChange}
                        helperText="e.g., $1M SAFE"
                      />
                      <Input
                        label="Product Status"
                        name="product_status"
                        value={reviewData.product_status}
                        onChange={handleReviewChange}
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
                          value={reviewData.business_model}
                          onChange={handleReviewChange}
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
                          value={reviewData.value_proposition}
                          onChange={handleReviewChange}
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
                          value={reviewData.target_market}
                          onChange={handleReviewChange}
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
                        value={reviewData.mrr}
                        onChange={handleReviewChange}
                        helperText="In dollars"
                      />
                      <Input
                        label="Annual Revenue"
                        name="revenue"
                        type="number"
                        value={reviewData.revenue}
                        onChange={handleReviewChange}
                        helperText="In dollars"
                      />
                      <Input
                        label="Monthly Burn Rate"
                        name="burn_rate"
                        type="number"
                        value={reviewData.burn_rate}
                        onChange={handleReviewChange}
                        helperText="In dollars"
                      />
                      <Input
                        label="Runway (months)"
                        name="runway_months"
                        type="number"
                        value={reviewData.runway_months}
                        onChange={handleReviewChange}
                      />
                      <Input
                        label="Total Raised to Date"
                        name="total_raised"
                        type="number"
                        value={reviewData.total_raised}
                        onChange={handleReviewChange}
                        helperText="In dollars"
                      />
                      <Input
                        label="Current Valuation"
                        name="valuation"
                        type="number"
                        value={reviewData.valuation}
                        onChange={handleReviewChange}
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
                        value={reviewData.team_size}
                        onChange={handleReviewChange}
                      />
                      <Input
                        label="Market Size"
                        name="market_size"
                        value={reviewData.market_size}
                        onChange={handleReviewChange}
                        helperText="e.g., $2.3B (2024)"
                      />
                      <Input
                        label="Market Growth"
                        name="market_growth"
                        value={reviewData.market_growth}
                        onChange={handleReviewChange}
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
                          value={reviewData.traction}
                          onChange={handleReviewChange}
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
                          value={reviewData.use_of_funds}
                          onChange={handleReviewChange}
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
