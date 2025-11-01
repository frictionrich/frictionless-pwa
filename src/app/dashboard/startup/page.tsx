'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { InvestorDetailModal } from '@/components/startup/InvestorDetailModal';

export default function StartupDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [lastDeckUploadedAt, setLastDeckUploadedAt] = useState<Date | null>(null);
  const [hasDeckUploaded, setHasDeckUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [selectedMatchPercentage, setSelectedMatchPercentage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load startup profile
      const { data: profile } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load matches for this startup with investor details
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          startup_id,
          investor_id,
          match_percentage,
          status,
          created_at,
          updated_at
        `)
        .eq('startup_id', user.id)
        .order('match_percentage', { ascending: false })
        .limit(7);

      // If we have matches, fetch the investor details separately
      let enrichedMatches: any[] = [];
      if (matchesData && matchesData.length > 0) {
        const investorIds = matchesData.map(m => m.investor_id);

        const { data: investorsData } = await supabase
          .from('investor_profiles')
          .select('*')
          .in('user_id', investorIds);

        // Combine matches with investor data
        enrichedMatches = matchesData.map(match => ({
          ...match,
          investor: investorsData?.find(inv => inv.user_id === match.investor_id)
        }));
      }

      if (matchesError) {
        console.error('Error loading matches:', matchesError);
      }

      // Get the latest pitch deck upload timestamp from storage
      const { data: files, error: storageError } = await supabase
        .storage
        .from('pitch-decks')
        .list(user.id, {
          limit: 1,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (!storageError && files && files.length > 0) {
        setHasDeckUploaded(true);
        setLastDeckUploadedAt(new Date(files[0].created_at));
      } else {
        setHasDeckUploaded(false);
      }

      setUser(user);
      setProfile(profile);
      setMatches(enrichedMatches);
      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  const handleConnectClick = (investor: any, matchPercentage: number) => {
    setSelectedInvestor(investor);
    setSelectedMatchPercentage(matchPercentage);
    setIsModalOpen(true);
  };

  const handleDeckUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes

    // Validate file size
    if (file.size > maxSize) {
      setUploadError('File size exceeds 4.5MB limit. Please upload a smaller file.');
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      // Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/pitch-deck-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('pitch-decks')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pitch-decks')
        .getPublicUrl(fileName);

      // Analyze pitch deck with AI
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        const analysisResponse = await fetch('/api/analyze-pitch-deck', {
          method: 'POST',
          body: formDataToSend,
        });

        if (analysisResponse.ok) {
          const result = await analysisResponse.json();
          const analysis = result.analysis;

          // Update startup profile with AI analysis
          await supabase
            .from('startup_profiles')
            .upsert({
              user_id: user.id,
              pitch_deck_url: publicUrl,
              company_name: analysis.company_name,
              industry: analysis.industry,
              stage: analysis.stage,
              headquarters: analysis.headquarters,
              funding_ask: analysis.funding_ask,
              business_model: analysis.business_model,
              value_proposition: analysis.value_proposition,
              target_market: analysis.target_market,
              competitive_landscape: analysis.competitive_landscape,
              key_differentiators: analysis.key_differentiators,
              key_challenges: analysis.key_challenges,
              team_size: analysis.team_size,
              team_members: analysis.team_members,
              mrr: analysis.mrr,
              revenue: analysis.revenue,
              burn_rate: analysis.burn_rate,
              runway_months: analysis.runway_months,
              total_raised: analysis.total_raised,
              valuation: analysis.valuation,
              traction: analysis.traction,
              product_status: analysis.product_status,
              geography_focus: analysis.geography_focus,
              use_of_funds: analysis.use_of_funds,
              market_size: analysis.market_size,
              market_growth: analysis.market_growth,
              recommendations: analysis.recommendations,
              strategic_insights: analysis.strategic_insights,
              readiness_assessment: analysis.readiness_assessment,
              readiness_score: analysis.readiness_assessment?.overall_score,
              ai_analyzed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            });
        }
      } catch (analysisError) {
        console.error('AI analysis failed:', analysisError);
        // Continue without analysis - not critical
      }

      // Reload dashboard data to show updated information
      setUploading(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload pitch deck');
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If no deck uploaded, show upload prompt only
  if (!hasDeckUploaded) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar role="startup" userName={user?.user_metadata?.name} userEmail={user?.email} />

        <main className="flex-1 overflow-y-auto bg-neutral-silver">
          <div className="container max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <Card className="max-w-2xl w-full">
                <CardContent className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-tint-5 flex items-center justify-center">
                      <span className="text-4xl">📄</span>
                    </div>
                    <h2 className="text-h2 font-semibold mb-3">Upload Your Pitch Deck</h2>
                    <p className="text-body-2 text-neutral-grey mb-6">
                      Get started by uploading your pitch deck. Our AI will analyze it and match you with relevant investors.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="medium"
                    onClick={() => router.push('/onboarding/startup')}
                  >
                    Upload Pitch Deck
                  </Button>
                  <p className="text-body-3 text-neutral-grey mt-4">
                    Supported format: PDF (max 4.5MB)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Format ticket size
  const formatTicketSize = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (!min && max) return `Up to ${formatCurrency(max)}`;
    if (min && !max) return `From ${formatCurrency(min)}`;
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    return 'Not specified';
  };

  // Calculate stats
  const matchCount = matches.length;
  const totalPotential = matches.reduce((sum, match) => {
    const investor = match.investor as any;
    return sum + (investor?.ticket_size_max || 500000);
  }, 0);
  const readinessScore = profile?.readiness_score || 0;

  // Determine which matches to display
  const displayedMatches = showAllMatches ? matches : matches.slice(0, 3);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="startup" userName={user?.user_metadata?.name} userEmail={user?.email} />

      <main className="flex-1 overflow-y-auto bg-neutral-silver">
        <div className="container max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-h2 font-semibold mb-2">
              Welcome back{profile?.company_name ? `, ${profile.company_name}` : ''}
            </h1>
            <p className="text-body-2 text-neutral-grey">
              Here's your funding journey overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Investor Matches</p>
                <p className="text-h1 font-semibold">{matchCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <p className="text-body-3 text-neutral-grey mb-2">Potential Raise</p>
                <p className="text-h1 font-semibold">
                  {totalPotential > 0 ? formatCurrency(totalPotential) : 'N/A'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-body-3 text-neutral-grey">Readiness Score</p>
                  <Button variant="tertiary" size="small">View More</Button>
                </div>
                <p className="text-h1 font-semibold">
                  {readinessScore > 0 ? `${Math.round(readinessScore)}%` : 'Not assessed'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Funding Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Investor Matches</CardTitle>
                  {!showAllMatches && matches.length > 3 && (
                    <Button
                      variant="tertiary"
                      size="small"
                      onClick={() => setShowAllMatches(true)}
                    >
                      View All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-body-2 text-neutral-grey mb-4">No investor matches yet</p>
                    <p className="text-body-3 text-neutral-grey">
                      Complete your profile to get matched with investors
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 overflow-x-auto">
                    <div className="grid grid-cols-[2fr_1.2fr_1.5fr_1.3fr] gap-3 min-w-[640px] text-body-3 text-neutral-grey border-b border-neutral-silver pb-2">
                      <div>Name</div>
                      <div>Potential Ticket</div>
                      <div>Profile Summary</div>
                      <div className="text-right">Match</div>
                    </div>
                    {displayedMatches.map((match) => {
                      const investor = match.investor as any;
                      if (!investor) return null;

                      return (
                        <div key={match.id} className="grid grid-cols-[2fr_1.2fr_1.5fr_1.3fr] gap-3 min-w-[640px] items-center py-3 border-b border-neutral-silver last:border-0">
                          <div>
                            <div className="flex items-center gap-3">
                              {investor.logo_url ? (
                                <img
                                  src={investor.logo_url}
                                  alt={investor.organization_name}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                                  {investor.organization_name?.charAt(0) || '?'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-body-2-medium text-neutral-black truncate">
                                  {investor.organization_name || 'Unknown'}
                                </p>
                                <p className="text-body-4 text-neutral-grey truncate">
                                  {investor.website || 'No website'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-body-3 text-neutral-grey truncate">
                            {formatTicketSize(investor.ticket_size_min, investor.ticket_size_max)}
                          </div>
                          <div className="text-body-3 text-neutral-grey truncate">
                            {investor.focus_sectors?.slice(0, 2).join(', ') || 'No focus specified'}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <MatchBadge percentage={match.match_percentage} />
                            <Button
                              variant="tertiary"
                              size="small"
                              onClick={() => handleConnectClick(investor, match.match_percentage)}
                            >
                              Connect
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funding Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-center py-8">
                    <p className="text-body-2 text-neutral-grey mb-2">
                      Funding tracking coming soon
                    </p>
                    <p className="text-body-3 text-neutral-grey">
                      Track your raise progress and milestones
                    </p>
                  </div>
                  <div className="space-y-2 text-left border-t border-neutral-silver pt-4">
                    <div className="flex justify-between">
                      <span className="text-body-3 text-neutral-grey">Potential:</span>
                      <span className="text-body-3-medium">
                        {totalPotential > 0 ? formatCurrency(totalPotential) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-3 text-neutral-grey">Investors:</span>
                      <span className="text-body-3-medium">{matchCount}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-silver pt-4">
                  <h4 className="text-body-2-medium mb-3">Next Steps</h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 bg-tint-5 rounded-lg border border-tint-3 cursor-pointer hover:bg-tint-6 transition-colors">
                      <span className="text-xl">📄</span>
                      <div className="flex-1">
                        <p className="text-body-3-medium text-neutral-black">
                          {uploading ? 'Uploading and analyzing...' : 'Upload New Deck'}
                        </p>
                        <p className="text-body-4 text-neutral-grey">Update your pitch deck to improve your profile.</p>
                        {lastDeckUploadedAt && !uploading && (
                          <p className="text-body-4 text-neutral-grey mt-1">
                            Last deck uploaded {formatDistanceToNow(lastDeckUploadedAt, { addSuffix: true })}
                          </p>
                        )}
                        {uploadError && (
                          <p className="text-body-4 text-red-600 mt-1">{uploadError}</p>
                        )}
                        {uploading && (
                          <p className="text-body-4 text-primary mt-1">Please wait, this may take a minute...</p>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleDeckUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    {/* TODO: Implement these features later */}
                    {/* <div className="flex items-start gap-3 p-3 bg-neutral-silver rounded-lg">
                      <span className="text-xl">✨</span>
                      <div className="flex-1">
                        <p className="text-body-3-medium text-neutral-black">Improve Readiness</p>
                        <p className="text-body-4 text-neutral-grey">Build the confidence investors trust.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-neutral-silver rounded-lg">
                      <span className="text-xl">🔓</span>
                      <div className="flex-1">
                        <p className="text-body-3-medium text-neutral-black">Unlock Intros</p>
                        <p className="text-body-4 text-neutral-grey">Your progress unlocks investor access.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-neutral-silver rounded-lg">
                      <span className="text-xl">👥</span>
                      <div className="flex-1">
                        <p className="text-body-3-medium text-neutral-black">View Dealroom</p>
                        <p className="text-body-4 text-neutral-grey">Manage your active investor pipeline.</p>
                      </div>
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Views Stats */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-h3 font-semibold">0</span>
                <span className="text-body-2 text-neutral-grey">Profile Views</span>
                <span className="text-body-3 text-neutral-grey">Analytics coming soon</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Investor Detail Modal */}
      <InvestorDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        investor={selectedInvestor}
        matchPercentage={selectedMatchPercentage}
      />
    </div>
  );
}
