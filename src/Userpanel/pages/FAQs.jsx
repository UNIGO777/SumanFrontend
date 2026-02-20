export default function FAQs() {
  return (
    <div className="bg-white">
      <div className="w-full bg-gray-100">
        <div className="w-full px-8 py-10 text-center sm:px-12 md:px-8 lg:px-14">
          <div className="text-2xl font-semibold text-gray-900 sm:text-3xl md:text-4xl">FAQs</div>
          <div className="mt-2 text-xs font-semibold text-gray-600 sm:text-sm md:text-base">
            Quick answers to common questions.
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-10 sm:px-12 md:px-8 lg:px-14">
        <div className="mx-auto max-w-4xl space-y-8 text-sm text-gray-700 sm:text-base">
          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">How do I track my order?</div>
            <div>
              Use the Track Order page and enter your order information. Tracking updates are available once the courier
              details are generated.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900 sm:text-lg">What is your refund process?</div>
            <div>
              Refund eligibility and processing timelines are described on the Refund Policy page.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
