import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-tint-5">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:text-primary-dark text-body-2 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-h1 font-semibold mb-2">Privacy Policy</h1>
          <p className="text-body-2 text-neutral-grey">
            Last updated: October 31, 2025
          </p>
        </div>

        <Card>
          <CardContent className="py-8 space-y-6">
            <section>
              <h2 className="text-h3 font-semibold mb-3">1. Introduction</h2>
              <p className="text-body-2 text-neutral-grey">
                Frictionless ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">2. Information We Collect</h2>

              <h3 className="text-h4 font-medium mb-2 mt-4">2.1 Information You Provide</h3>
              <p className="text-body-2 text-neutral-grey mb-3">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>Account information (name, email address, password)</li>
                <li>Profile information (company name, role, bio, logo)</li>
                <li>Business information (sector, stage, location, funding status)</li>
                <li>Pitch decks and business documents</li>
                <li>Investment preferences and criteria</li>
                <li>Communications with other users</li>
                <li>Social media profile links</li>
              </ul>

              <h3 className="text-h4 font-medium mb-2 mt-4">2.2 Automatically Collected Information</h3>
              <p className="text-body-2 text-neutral-grey mb-3">
                When you use our Service, we automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages viewed, time spent, features used)</li>
                <li>Log data (access times, error logs)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Create and manage your account</li>
                <li>Match startups with relevant investors using AI algorithms</li>
                <li>Analyze pitch decks and provide readiness assessments</li>
                <li>Send you notifications, updates, and marketing communications</li>
                <li>Respond to your requests and provide customer support</li>
                <li>Monitor and analyze usage trends and preferences</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">4. How We Share Your Information</h2>

              <h3 className="text-h4 font-medium mb-2 mt-4">4.1 With Other Users</h3>
              <p className="text-body-2 text-neutral-grey mb-3">
                Your profile information is visible to other users of the platform:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>Startups can view investor profiles and investment criteria</li>
                <li>Investors can view startup profiles and pitch information</li>
                <li>Match scores and recommendations are shared between matched parties</li>
              </ul>

              <h3 className="text-h4 font-medium mb-2 mt-4">4.2 With Service Providers</h3>
              <p className="text-body-2 text-neutral-grey">
                We share information with third-party service providers who perform services on our behalf, including:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4 mt-3">
                <li>Cloud hosting providers (Vercel, Supabase)</li>
                <li>AI and machine learning providers (OpenAI)</li>
                <li>Analytics providers</li>
                <li>Email service providers</li>
              </ul>

              <h3 className="text-h4 font-medium mb-2 mt-4">4.3 For Legal Reasons</h3>
              <p className="text-body-2 text-neutral-grey">
                We may disclose your information if required by law or in response to legal process, or to protect the rights, property, or safety of Frictionless, our users, or others.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">5. AI and Automated Processing</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                We use artificial intelligence and automated processing to:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>Analyze pitch decks and extract key information</li>
                <li>Calculate investment readiness scores</li>
                <li>Match startups with investors based on compatibility</li>
                <li>Generate recommendations and insights</li>
              </ul>
              <p className="text-body-2 text-neutral-grey mt-3">
                Your pitch decks and business information may be processed by OpenAI's GPT-4 model. We do not use your data to train AI models, and OpenAI does not retain your data beyond the processing period.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">6. Data Security</h2>
              <p className="text-body-2 text-neutral-grey">
                We implement appropriate technical and organizational measures to protect your information, including encryption, access controls, and secure data storage. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">7. Data Retention</h2>
              <p className="text-body-2 text-neutral-grey">
                We retain your information for as long as your account is active or as needed to provide you services. You can request deletion of your account and data at any time by contacting us at privacy@frictionless.com.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">8. Your Rights and Choices</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                You have the following rights regarding your information:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Object:</strong> Object to certain processing of your data</li>
              </ul>
              <p className="text-body-2 text-neutral-grey mt-3">
                To exercise these rights, please contact us at privacy@frictionless.com
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">9. Cookies and Tracking Technologies</h2>
              <p className="text-body-2 text-neutral-grey mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-body-2 text-neutral-grey space-y-2 ml-4">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Provide personalized content</li>
              </ul>
              <p className="text-body-2 text-neutral-grey mt-3">
                You can control cookies through your browser settings. However, disabling cookies may affect the functionality of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">10. Third-Party Links</h2>
              <p className="text-body-2 text-neutral-grey">
                Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read their privacy policies before providing any information.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">11. Children's Privacy</h2>
              <p className="text-body-2 text-neutral-grey">
                Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">12. International Data Transfers</h2>
              <p className="text-body-2 text-neutral-grey">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from those in your country. By using our Service, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">13. California Privacy Rights</h2>
              <p className="text-body-2 text-neutral-grey">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, use, and share, and the right to request deletion of your information.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">14. Changes to This Privacy Policy</h2>
              <p className="text-body-2 text-neutral-grey">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-h3 font-semibold mb-3">15. Contact Us</h2>
              <p className="text-body-2 text-neutral-grey">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-3 text-body-2 text-neutral-grey">
                <p>Email: privacy@frictionless.com</p>
                <p>Address: Frictionless, Inc., Austin, TX 78701</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
