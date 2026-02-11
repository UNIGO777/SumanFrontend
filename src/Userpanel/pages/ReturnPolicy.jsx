import { Link } from 'react-router-dom'

export default function ReturnPolicy() {
  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-2xl font-semibold text-gray-900 sm:text-3xl md:text-4xl">Return Policy</div>
          <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">
            Return rules for orders placed on our website.
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-4xl space-y-8 text-sm text-gray-700 sm:text-base">
          <div className="rounded-xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <div className="text-sm font-semibold text-amber-900">My Business does not support returns</div>
            <div className="mt-2 text-sm text-amber-900/90">
              We currently do not accept returns. Please review product details carefully before placing an order.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">Damaged / incorrect items</div>
            <div>
              If you receive a damaged or incorrect item, please contact us as soon as possible with your order details
              and supporting photos/videos. We will review the request and help with a resolution.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">Refunds</div>
            <div>
              Refund eligibility and processing is described in our Refund Policy.
            </div>
            <div className="font-semibold text-gray-800">
              See: <Link to="/refund-policy" className="text-[#0f2e40] underline">Refund Policy</Link>
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
