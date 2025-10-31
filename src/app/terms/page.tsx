import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-tint-5">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:text-primary-dark text-body-2 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-h1 font-semibold mb-2">Terms of Use</h1>
          <p className="text-body-2 text-neutral-grey">
            Last updated: October 31, 2025
          </p>
        </div>

        <Card>
          <CardContent className="py-8 space-y-6">
            <section>
              <h2 className="text-h3 font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-body-2 text-neutral-grey">
                By accessing and using the Frictionless platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Use, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">2. Description of Service</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                Frictionless is a platform that connects startups with investors. The Service provides:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>AI-powered pitch deck analysis and investment readiness assessment</li>
                <li>Matching algorithms to connect startups with relevant investors</li>
                <li>Profile management for both startups and investors</li>
                <li>Communication and collaboration tools</li>
                <li>Analytics and performance tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">3. User Accounts</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">4. User Content</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                You retain ownership of all content you submit to the Service, including pitch decks, business plans, and profile information. By submitting content, you grant Frictionless a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content solely for the purpose of operating and improving the Service.
              </p>
              <p className="text-body-2 text-neutral-grey">
                You represent and warrant that you own or have the necessary rights to all content you submit and that such content does not violate any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">5. Prohibited Conduct</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">6. Investment Disclaimer</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                Frictionless is a platform that facilitates connections between startups and investors. We do not provide investment advice, financial advice, or recommendations. All investment decisions are made at your own risk.
              </p>
              <p className="text-body-2 text-neutral-grey">
                The AI-powered analysis and readiness scores are for informational purposes only and should not be considered as investment advice or guarantees of success.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">7. Privacy</h2>
              <p className="text-body-2 text-neutral-grey">
                Your use of the Service is also governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, which is incorporated into these Terms of Use by reference.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">8. Intellectual Property</h2>
              <p className="text-body-2 text-neutral-grey">
                The Service and its original content, features, and functionality are owned by Frictionless and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">9. Termination</h2>
              <p className="text-body-2 text-neutral-grey">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-body-2 text-neutral-grey">
                To the maximum extent permitted by law, Frictionless shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">11. Disclaimers</h2>
              <p className="text-body-2 text-neutral-grey">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">12. Changes to Terms</h2>
              <p className="text-body-2 text-neutral-grey">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">13. Governing Law</h2>
              <p className="text-body-2 text-neutral-grey">
                These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">14. Contact Information</h2>
              <p className="text-body-2 text-neutral-grey">
                If you have any questions about these Terms, please contact us at legal@frictionless.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
