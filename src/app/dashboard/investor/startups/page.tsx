'use client';

import { Card, CardContent } from '@/components/ui/Card';

export default function StartupsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h2 font-semibold mb-2">Startup Matches</h1>
        <p className="text-body-2 text-neutral-grey">
          Discover and evaluate startups that match your investment thesis
        </p>
      </div>

      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-neutral-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-h3 font-semibold mb-3">Startup Discovery Coming Soon</h2>
            <p className="text-body-2 text-neutral-grey mb-6 max-w-md mx-auto">
              We're building a powerful deal flow management system with AI-powered matching and comprehensive startup profiles.
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto bg-tint-5 rounded-lg p-6 border border-tint-3">
              <p className="text-body-3-medium text-neutral-black mb-3">What's coming:</p>
              <ul className="space-y-2 text-body-3 text-neutral-grey">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>AI-powered matching based on your investment thesis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Advanced filtering by sector, stage, geography, traction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Comprehensive startup profiles with pitch decks and metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Readiness assessments and investment insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Deal flow pipeline with kanban-style management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Direct messaging and meeting scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Watchlist and note-taking features</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
