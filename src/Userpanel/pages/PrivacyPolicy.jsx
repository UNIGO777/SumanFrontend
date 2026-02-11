import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-2xl font-semibold text-gray-900 sm:text-3xl md:text-4xl">Privacy Policy</div>
          <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">
            How we collect, use, and protect your information.
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-4xl space-y-8 text-sm text-gray-700 sm:text-base">
          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">Information we collect</div>
            <div>
              We may collect information you provide during checkout or account actions such as name, email, phone,
              shipping address, and payment-related identifiers required to complete the transaction.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">How we use information</div>
            <div>
              We use your information to process orders, provide customer support, improve our services, and comply with
              legal requirements.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">Data sharing</div>
            <div>
              We may share necessary information with shipping partners, payment providers, and service vendors strictly
              for order fulfillment and service delivery.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">Security</div>
            <div>
              We take reasonable measures to protect your information. However, no online transmission is completely
              secure.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">Contact</div>
            <div>
              For privacy-related queries, please contact us using the contact details available on the website.
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-5 ring-1 ring-gray-200">
            <div className="text-sm font-semibold text-gray-900">More policies</div>
            <div className="mt-2 text-sm text-gray-700">
              Visit{' '}
              <Link to="/policies" className="font-semibold text-[#0f2e40] underline">
                Policies
              </Link>{' '}
              for all policy pages.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
