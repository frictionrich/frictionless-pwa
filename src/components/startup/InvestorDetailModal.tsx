'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MatchBadge } from '@/components/ui/MatchBadge';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface InvestorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: any;
  matchPercentage: number;
}

export function InvestorDetailModal({ isOpen, onClose, investor, matchPercentage }: InvestorDetailModalProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!investor) return null;

  const formatTicketSize = (min?: number, max?: number) => {
    if (!min && !max) return 'Not Available';
    if (!min && max) return `Up to ${formatCurrency(max)}`;
    if (min && !max) return `From ${formatCurrency(min)}`;
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    return 'Not Available';
  };

  // Truncate description for initial display
  const descriptionPreview = investor.description?.substring(0, 150) || '';
  const hasMoreDescription = investor.description && investor.description.length > 150;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {investor.logo_url ? (
              <img
                src={investor.logo_url}
                alt={investor.organization_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-medium">
                {investor.organization_name?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-h3 font-semibold">{investor.organization_name || 'Unknown Investor'}</h2>
                <MatchBadge percentage={matchPercentage} />
              </div>
              {investor.website && (
                <a
                  href={investor.website.startsWith('http') ? investor.website : `https://${investor.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-3 text-primary hover:underline"
                >
                  {investor.website}
                </a>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-grey hover:text-neutral-black transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Grid */}
        <div className="space-y-6">
          {/* Location */}
          {investor.headquarters && (
            <div>
              <h3 className="text-body-2-medium text-neutral-black mb-2">Location</h3>
              <div className="flex items-center gap-2">
                <span className="text-body-3 text-neutral-grey">🇺🇸</span>
                <span className="text-body-3 text-neutral-grey">{investor.headquarters}</span>
              </div>
            </div>
          )}

          {/* Investment Philosophy */}
          {investor.description && (
            <div>
              <h3 className="text-body-2-medium text-neutral-black mb-2">Investment Philosophy</h3>
              <p className="text-body-3 text-neutral-grey leading-relaxed">
                {showFullDescription ? investor.description : descriptionPreview}
                {hasMoreDescription && !showFullDescription && '...'}
              </p>
              {hasMoreDescription && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-body-3 text-primary hover:underline mt-2"
                >
                  {showFullDescription ? 'Read less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Fund Size */}
            <div>
              <h3 className="text-body-2-medium text-neutral-black mb-2">Fund Size</h3>
              <p className="text-body-3 text-neutral-grey">Not Available</p>
            </div>

            {/* Portfolio Examples */}
            <div>
              <h3 className="text-body-2-medium text-neutral-black mb-2">Portfolio Examples</h3>
              <p className="text-body-3 text-neutral-grey">Not Available</p>
            </div>

            {/* Avg. Ticket */}
            <div>
              <h3 className="text-body-2-medium text-neutral-black mb-2">Avg. Ticket</h3>
              <p className="text-body-3 text-neutral-grey">
                {formatTicketSize(investor.ticket_size_min, investor.ticket_size_max)}
              </p>
            </div>

            {/* Geographic Bias */}
            <div>
              <h3 className="text-body-2-medium text-neutral-black mb-2">Geographic Bias</h3>
              <div className="flex gap-2 flex-wrap">
                {investor.geography && investor.geography.length > 0 ? (
                  investor.geography.map((geo: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-neutral-silver rounded-full text-body-4 text-neutral-black"
                    >
                      {geo}
                    </span>
                  ))
                ) : (
                  <p className="text-body-3 text-neutral-grey">Not specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Primary Verticals */}
          {investor.focus_sectors && investor.focus_sectors.length > 0 && (
            <div>
              <h3 className="text-body-2-medium text-neutral-black mb-2">Primary Verticals</h3>
              <p className="text-body-3 text-neutral-grey">
                {investor.focus_sectors.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Footer with Connect Button */}
        <div className="mt-8 pt-6 border-t border-neutral-silver flex justify-end">
          <Button variant="primary" size="medium">
            Connect
          </Button>
        </div>
      </div>
    </Modal>
  );
}
