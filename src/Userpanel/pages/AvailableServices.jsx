export default function AvailableServices() {
  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-2xl font-semibold text-gray-900 sm:text-3xl md:text-4xl">Available Services</div>
          <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">
            Support and services we provide.
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-4xl space-y-8 text-sm text-gray-700 sm:text-base">
          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">Customer support</div>
            <div>
              For product queries, order help, and policy-related questions, reach out using the contact details in the
              footer.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">Order tracking</div>
            <div>
              Track your order status using the Track Order page once your shipment details are available.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
