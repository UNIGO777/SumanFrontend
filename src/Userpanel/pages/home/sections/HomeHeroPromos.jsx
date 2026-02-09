import heroBanner from '../../../../assets/2048 × 626.jpg'
import promoBanner1 from '../../../../assets/1312 × 668.jpg'
import promoBanner2 from '../../../../assets/1312 × 668-2.jpg'

export default function HomeHeroPromos() {
  return (
    <section className="space-y-4">
      <div className="mx-auto max-w-[92vw] text-center">
        <div className="text-3xl font-bold text-gray-900">Latest Offers</div>
        <div className="mt-2 text-sm font-semibold text-gray-600">
          Discover new drops, best deals, and limited-time savings.
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
        <img
          src={heroBanner}
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
            src={promoBanner1}
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
            src={promoBanner2}
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
