import shippingBanner from '../../../../assets/2048 × 626-2.jpg'

export default function HomeInternationalShippingBanner() {
  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="mx-auto mb-6 max-w-[92vw] text-center">
          <div className="text-3xl font-bold text-gray-900">International Shipping</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Send love across borders with secure packaging and reliable delivery.
          </div>
        </div>

        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
          <div className="mx-auto w-full max-w-[92vw] md:max-w-none">
            <div className="relative overflow-hidden bg-gray-100 ring-1 ring-gray-200 md:rounded-[36px]">
              <img
                src={shippingBanner}
                alt="International shipping"
                className="h-[220px] w-full object-cover sm:h-[280px] md:h-[340px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
