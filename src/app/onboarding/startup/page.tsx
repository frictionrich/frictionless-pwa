'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function StartupOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    linkedin: '',
    twitter: '',
    pitchDeckFile: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, pitchDeckFile: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User:', user);
      if (!user) throw new Error('Not authenticated');

      // Create or update profile using upsert
      console.log('Creating profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          role: 'startup',
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }
      console.log('Profile created or already exists');

      // Upload pitch deck and analyze if provided
      let pitchDeckUrl = null;
      let analysis = null;

      if (formData.pitchDeckFile) {
        // Upload file
        console.log('Uploading pitch deck...');
        const fileExt = formData.pitchDeckFile.name.split('.').pop();
        const fileName = `${user.id}/pitch-deck-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('pitch-decks')
          .upload(fileName, formData.pitchDeckFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        console.log('File uploaded successfully');

        const { data: { publicUrl } } = supabase.storage
          .from('pitch-decks')
          .getPublicUrl(fileName);

        pitchDeckUrl = publicUrl;

        // Analyze pitch deck with AI if it's a PDF
        if (fileExt?.toLowerCase() === 'pdf') {
          try {
            console.log('Starting AI analysis...');

            // Send PDF file as multipart/form-data
            const formDataToSend = new FormData();
            formDataToSend.append('file', formData.pitchDeckFile as File);

            console.log('Calling API with PDF file...');
            const analysisResponse = await fetch('/api/analyze-pitch-deck', {
              method: 'POST',
              body: formDataToSend, // Send as FormData, not JSON
            });

            console.log('API response status:', analysisResponse.status);
            if (analysisResponse.ok) {
              const result = await analysisResponse.json();
              analysis = result.analysis;
              console.log('Analysis result:', analysis);
            } else {
              console.log('AI analysis failed with status:', analysisResponse.status);
            }
          } catch (analysisError) {
            console.error('AI analysis failed:', analysisError);
            // Continue without analysis - not critical
          }
        }
      }

      // Create or update startup profile with AI-extracted data using upsert
      console.log('Creating startup profile...');
      const { error: startupError } = await supabase
        .from('startup_profiles')
        .upsert({
          user_id: user.id,
          company_name: analysis?.company_name || formData.companyName,
          website: formData.website,
          pitch_deck_url: pitchDeckUrl,
          description: analysis?.value_proposition || analysis?.business_model || null,
          sector: analysis?.industry || null,
          stage: analysis?.stage || null,
          readiness_score: analysis?.readiness_assessment?.overall_score || null,
        }, {
          onConflict: 'user_id'
        });

      if (startupError) {
        console.error('Startup profile error:', startupError);
        throw startupError;
      }

      console.log('Startup profile created successfully!');
      console.log('Redirecting to dashboard...');

      // Redirect to dashboard
      router.push('/dashboard/startup');
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
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
                Tell us about your company
              </h1>
              <p className="text-body-2 text-neutral-grey mb-8">
                We'll use this information to create your profile and match you with the right investors.
              </p>

              {error && (
                <div className="mb-4 p-4 bg-error/10 border border-error rounded-md text-error text-body-3">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Company Name"
                  name="companyName"
                  type="text"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Website"
                  name="website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={handleChange}
                />

                <Input
                  label="LinkedIn (Optional)"
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/company/yourcompany"
                  value={formData.linkedin}
                  onChange={handleChange}
                />

                <Input
                  label="Twitter (Optional)"
                  name="twitter"
                  type="url"
                  placeholder="https://twitter.com/yourcompany"
                  value={formData.twitter}
                  onChange={handleChange}
                />

                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    variant="primary"
                    size="normal"
                    onClick={() => setStep(2)}
                    disabled={!formData.companyName}
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
                            PDF, PPT, or PPTX (max 50MB)
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
                    onClick={handleSubmit}
                    loading={loading}
                  >
                    Complete Setup
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
