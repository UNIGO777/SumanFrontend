import { Link } from 'react-router-dom'

export default function TermsAndConditions() {
  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-4xl font-semibold text-gray-900">Terms and Conditions</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Please read these terms carefully before using our website.
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-4xl space-y-8 text-sm text-gray-700">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">1. Acceptance of terms</div>
            <div>
              By accessing or using this website, you agree to be bound by these Terms and Conditions and all applicable
              laws and regulations.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">2. Products and pricing</div>
            <div>
              Product images are for illustration purposes. Prices, availability, and specifications may change without
              notice. We reserve the right to cancel any order in case of pricing or listing errors.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">3. Orders and payments</div>
            <div>
              An order is confirmed only after successful payment (where applicable) and confirmation. We may request
              additional verification for certain transactions.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">4. Shipping and delivery</div>
            <div>
              Delivery timelines are estimates and may vary due to location, courier constraints, or other factors beyond
              our control.
            </div>
            <div className="font-semibold text-gray-800">
              See: <Link to="/shipping-policy" className="text-[#0f2e40] underline">Shipping Policy</Link>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">5. Returns and refunds</div>
            <div>
              Returns and refunds (if any) are governed by our policies.
            </div>
            <div className="font-semibold text-gray-800">
              See:{' '}
              <Link to="/return-policy" className="text-[#0f2e40] underline">
                Return Policy
              </Link>{' '}
              and{' '}
              <Link to="/refund-policy" className="text-[#0f2e40] underline">
                Refund Policy
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">6. Privacy</div>
            <div>
              We respect your privacy and process personal data as described in our Privacy Policy.
            </div>
            <div className="font-semibold text-gray-800">
              See: <Link to="/privacy-policy" className="text-[#0f2e40] underline">Privacy Policy</Link>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-5 ring-1 ring-gray-200">
            <div className="text-sm font-semibold text-gray-900">Policies</div>
            <div className="mt-2 text-sm text-gray-700">
              For a full list of policies, visit{' '}
              <Link to="/policies" className="font-semibold text-[#0f2e40] underline">
                Policies
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
