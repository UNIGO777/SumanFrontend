import { Link } from 'react-router-dom'

export default function ShippingPolicy() {
  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-4xl font-semibold text-gray-900">Shipping Policy</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Shipping, delivery timelines, and order tracking information.
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-4xl space-y-8 text-sm text-gray-700">
          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">Order processing</div>
            <div>
              Orders are processed after confirmation. Processing times may vary during high-demand periods, promotions,
              or due to verification requirements.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">Delivery timelines</div>
            <div>
              Delivery timelines depend on your location and courier operations. The estimated timeline shown during
              checkout is an estimate and not a guarantee.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">Tracking</div>
            <div>
              If tracking is available for your order, tracking details will be shared after dispatch.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-900">Shipping issues</div>
            <div>
              For delivery issues such as non-delivery or damaged packaging, please contact us with your order details.
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
