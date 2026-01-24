import ItemPanel from './components/ItemPanel.jsx'
import RecipientPanel from './components/RecipientPanel.jsx'
import BestSellerPanel from './components/BestSellerPanel.jsx'
import HomeOccasionSection from './pages/home/sections/HomeOccasionSection.jsx'
import HomeEssentialsSection from './pages/home/sections/HomeEssentialsSection.jsx'
import HomeLaunchBannerSection from './pages/home/sections/HomeLaunchBannerSection.jsx'
import HomeMostGiftedSection from './pages/home/sections/HomeMostGiftedSection.jsx'
import HomeLatestCollectionsSection from './pages/home/sections/HomeLatestCollectionsSection.jsx'
import HomeInternationalShippingBanner from './pages/home/sections/HomeInternationalShippingBanner.jsx'
import HomeValentineSpecialSection from './pages/home/sections/HomeValentineSpecialSection.jsx'
import HomeCustomerStoriesSection from './pages/home/sections/HomeCustomerStoriesSection.jsx'

const index = () => {
  return (
    <div className="mx-auto px-4 py-6">
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
          <img
            src="https://www.giva.co/cdn/shop/files/Frame_1171278768.webp?v=1767081699&width=3840"
            alt="Promo banner"
            className="h-full w-full object-contain "
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
          <div className="absolute left-5 top-1/2 w-[90%] -translate-y-1/2 sm:left-8 sm:w-[70%]"></div>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 max-w-[90vw] mx-auto">
          <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
            <img
              src="https://www.giva.co/cdn/shop/files/80_Desktop.webp?v=1766124595&width=3840"
              alt="Promo card 2"
              className="h-[250px] w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-gray-900">
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
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-gray-900">
              BOGO - Buy 1 Get 1
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ItemPanel />
      </div>

      <div className="mt-10">
        <RecipientPanel />
      </div>

      <div className="mt-12">
        <div className="mx-auto max-w-[92vw]">
          <BestSellerPanel
            products={[
              {
                showBestseller: true,
                images: [
                  'https://www.giva.co/cdn/shop/files/BR01247_1.jpg?v=1743681996&width=1346',
                  'https://www.giva.co/cdn/shop/files/BR01247_2.jpg?v=1743681996&width=1346',
                ],
                rating: 4.8,
                ratingCount: 326,
                price: 3799,
                originalPrice: 8399,
                title: 'Silver Classic Solitaire Ring',
                couponText: 'EXTRA 5% OFF with coupon',
              },
              {
                showBestseller: true,
                images: [
                  'https://www.giva.co/cdn/shop/files/BR01247_1.jpg?v=1743681996&width=1346',
                  'https://www.giva.co/cdn/shop/files/BR01247_2.jpg?v=1743681996&width=1346',
                ],
                rating: 4.8,
                ratingCount: 326,
                price: 3799,
                originalPrice: 8399,
                title: 'Silver Classic Solitaire Ring',
                couponText: 'EXTRA 5% OFF with coupon',
              },
              {
                images: [
                  'https://www.giva.co/cdn/shop/files/Personalised_Icon.webp?v=1766122556',
                  'https://www.giva.co/cdn/shop/files/Silver_Chains_Icon.webp?v=1766122556',
                ],
                rating: 4.6,
                ratingCount: 112,
                price: 2199,
                originalPrice: 3999,
                title: 'Silver Minimal Pendant',
                couponText: 'EXTRA 5% OFF with coupon',
              },
              {
                showBestseller: false,
                images: [
                  'https://www.giva.co/cdn/shop/files/Rings_Icon.webp?v=1766122556',
                  'https://www.giva.co/cdn/shop/files/Bracelets_Icon.webp?v=1766122556',
                ],
                rating: 4.7,
                ratingCount: 84,
                price: 1599,
                originalPrice: 2999,
                title: 'Silver Everyday Ring',
                couponText: 'EXTRA 5% OFF with coupon',
              },
            ]}
          />
        </div>
      </div>

      <HomeOccasionSection />
      <HomeEssentialsSection />
      <HomeLaunchBannerSection />
      <HomeMostGiftedSection/>
      <HomeLatestCollectionsSection/>
      <HomeInternationalShippingBanner/>
      <HomeValentineSpecialSection/>
      <HomeCustomerStoriesSection/>
    </div>
  )
}

export default index
