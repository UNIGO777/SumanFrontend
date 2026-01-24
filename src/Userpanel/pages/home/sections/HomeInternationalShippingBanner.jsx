export default function HomeInternationalShippingBanner() {
  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
          <div className="mx-auto w-full max-w-[92vw] md:max-w-none">
            <div className="relative overflow-hidden bg-gray-100 ring-1 ring-gray-200 md:rounded-[36px]">
              <img
                src="https://www.giva.co/cdn/shop/files/nternational_Shipping_collection_web_1.webp?v=1768817085&width=2000"
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
