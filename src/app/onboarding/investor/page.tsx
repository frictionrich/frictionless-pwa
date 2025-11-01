'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

  const sectors = ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'AI/ML', 'Blockchain', 'Climate Tech'];
  const stages = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Profile is automatically created by database trigger on signup
      // Upload investor deck and analyze if provided
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

            // Send PDF file as multipart/form-data
            const formDataToSend = new FormData();
            formDataToSend.append('file', formData.investorDeckFile as File);

            console.log('Calling API with PDF file...');
            const analysisResponse = await fetch('/api/analyze-investor-deck', {
              method: 'POST',
              body: formDataToSend, // Send as FormData, not JSON
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

      // Redirect to dashboard
      router.push('/dashboard/investor');
    } catch (err: any) {
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
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-h2 font-semibold mb-2">
                Upload your investor deck (Optional)
              </h1>
              <p className="text-body-2 text-neutral-grey mb-8">
                Share more about your fund, portfolio, and investment approach.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Investor Deck (PDF, PPT, or PPTX)
                  </label>
                  <div className="border-2 border-dashed border-neutral-grey-blue rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="investor-deck"
                    />
                    <label htmlFor="investor-deck" className="cursor-pointer">
                      {formData.investorDeckFile ? (
                        <div>
                          <p className="text-body-2 text-neutral-black mb-2">
                            {formData.investorDeckFile.name}
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

                <div className="flex justify-between gap-4 mt-8">
                  <Button
                    variant="secondary"
                    size="normal"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="tertiary"
                      size="normal"
                      onClick={handleSubmit}
                      loading={loading}
                      disabled={loading}
                    >
                      Skip
                    </Button>
                    <Button
                      variant="primary"
                      size="normal"
                      onClick={handleSubmit}
                      loading={loading}
                    >
                      Complete Setup
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
