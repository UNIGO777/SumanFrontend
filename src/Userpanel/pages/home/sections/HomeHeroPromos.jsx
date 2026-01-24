export default function HomeHeroPromos() {
  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
        <img
          src="https://www.giva.co/cdn/shop/files/Frame_1171278768.webp?v=1767081699&width=3840"
          alt="Promo banner"
          className="h-full w-full object-contain "
          loading="lazy"
        />
        <div className="absolute inset-0" />
        <div className="absolute left-5 top-1/2 w-[90%] -translate-y-1/2 sm:left-8 sm:w-[70%]"></div>
      </div>

      <div className="grid grid-cols-1 gap-10 mx-auto max-w-[90vw] sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
          <img
            src="https://www.giva.co/cdn/shop/files/80_Desktop.webp?v=1766124595&width=3840"
            alt="Promo card 2"
            className="h-[250px] w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 " />
          <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-gray-900">
            Upto 80% OFF
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
          <img
            src="https://www.giva.co/cdn/shop/files/bogo.desktop_82adc342-b4ea-40ca-99e4-eacf5cab47d5.webp?v=1766122556&width=3840"
            alt="Promo card 1"
            className="h-[250px] w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 " />
          <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-gray-900">
            BOGO - Buy 1 Get 1
          </div>
        </div>
      </div>
    </section>
  )
}
