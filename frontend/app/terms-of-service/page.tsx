'use client';

import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using our URL shortening service, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                We provide a URL shortening service that allows users to create shortened versions of long URLs, 
                track click analytics, manage teams, and collaborate on link management. Our service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>URL shortening and redirection</li>
                <li>Click analytics and tracking</li>
                <li>Team collaboration features</li>
                <li>User management and roles</li>
                <li>Geographic analytics</li>
                <li>Reward and earnings system</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">3.1 Account Creation</h3>
                  <p className="text-gray-700">
                    To use our service, you must create an account. You agree to provide accurate, current, 
                    and complete information during registration and to update such information to keep it accurate, 
                    current, and complete.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">3.2 Account Security</h3>
                  <p className="text-gray-700">
                    You are responsible for safeguarding your account credentials and for all activities that occur 
                    under your account. You agree to notify us immediately of any unauthorized use of your account.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">3.3 Account Termination</h3>
                  <p className="text-gray-700">
                    We reserve the right to terminate or suspend your account at any time for violations of these terms 
                    or for any other reason at our sole discretion.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">You agree not to use our service to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Create links to illegal, harmful, or offensive content</li>
                <li>Distribute malware, viruses, or other harmful code</li>
                <li>Engage in phishing or other fraudulent activities</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the service for spam or mass unsolicited communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Links</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">5.1 User Content</h3>
                  <p className="text-gray-700">
                    You retain ownership of any content you submit through our service. By submitting content, 
                    you grant us a non-exclusive, worldwide, royalty-free license to use, store, and display 
                    such content in connection with providing our service.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">5.2 Third-Party Content</h3>
                  <p className="text-gray-700">
                    We are not responsible for the content of third-party websites that you link to through our service. 
                    You acknowledge that we have no control over such content and accept no responsibility for it.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Analytics and Data</h2>
              <p className="text-gray-700 mb-4">
                Our service collects and analyzes data about link usage, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Click counts and timestamps</li>
                <li>Geographic location data (country-level)</li>
                <li>User agent and referrer information</li>
                <li>IP addresses (for analytics purposes)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                This data is used to provide analytics services and improve our platform. 
                We handle this data in accordance with our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Team Features</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">7.1 Team Management</h3>
                  <p className="text-gray-700">
                    Team features allow users to collaborate on link management. Team leaders can invite members, 
                    assign roles, and manage team resources. All team activities must comply with these terms.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">7.2 Team Responsibilities</h3>
                  <p className="text-gray-700">
                    Team leaders are responsible for the actions of their team members. 
                    Violations by team members may result in consequences for the entire team.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Rewards and Earnings</h2>
              <p className="text-gray-700 mb-4">
                Our service may include a rewards system where users can earn based on link performance. 
                Participation in the rewards system is subject to additional terms and conditions.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Earnings are calculated based on legitimate clicks and traffic</li>
                <li>We reserve the right to adjust or terminate the rewards program</li>
                <li>Fraudulent activity will result in account termination and forfeiture of earnings</li>
                <li>Payment terms and minimum thresholds apply</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
              <p className="text-gray-700">
                We strive to maintain high service availability but do not guarantee uninterrupted access. 
                We may temporarily suspend the service for maintenance, updates, or other operational reasons. 
                We are not liable for any damages resulting from service interruptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Intellectual Property</h2>
              <p className="text-gray-700">
                Our service, including its software, design, and content, is protected by intellectual property laws. 
                You may not copy, modify, distribute, or create derivative works without our express written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, 
                data, or use, arising out of or relating to your use of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless our company, its officers, directors, employees, 
                and agents from any claims, damages, or expenses arising from your use of the service 
                or violation of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. We will notify users of significant changes 
                by posting the updated terms on our website. Your continued use of the service after such changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@shorly.uk<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Phone:</strong> [Your Contact Number]
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 