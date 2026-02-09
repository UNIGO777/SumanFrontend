import { Link } from 'react-router-dom'

export default function RefundPolicy() {
  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-4xl font-semibold text-gray-900">Refund Policy</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Refund eligibility and processing information.
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-4xl space-y-8 text-sm text-gray-700">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">Eligibility</div>
            <div>
              Refunds may be initiated in eligible cases such as order cancellation before dispatch, damaged item
              received, incorrect item received, or non-delivery (subject to verification).
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">Processing time</div>
            <div>
              Once approved, refunds are processed to the original payment method as per the payment provider’s timeline.
              Bank or UPI settlement times may vary.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">Return requirement</div>
            <div>
              If a return is required for verification, the applicable return rules are described in our Return Policy.
            </div>
            <div className="font-semibold text-gray-800">
              See: <Link to="/return-policy" className="text-[#0f2e40] underline">Return Policy</Link>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">Contact</div>
            <div>
              For refund requests, please contact us using the contact details available on the website along with your
              order details.
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
