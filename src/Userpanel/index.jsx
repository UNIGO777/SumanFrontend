import ItemPanel from './components/ItemPanel.jsx'
import RecipientPanel from './components/RecipientPanel.jsx'
import BestSellerPanel from './components/BestSellerPanel.jsx'
import { useEffect, useState } from 'react'
import HomeOccasionSection from './pages/home/sections/HomeOccasionSection.jsx'
import HomeEssentialsSection from './pages/home/sections/HomeEssentialsSection.jsx'
import HomeLaunchBannerSection from './pages/home/sections/HomeLaunchBannerSection.jsx'
import HomeMostGiftedSection from './pages/home/sections/HomeMostGiftedSection.jsx'
import HomeLatestCollectionsSection from './pages/home/sections/HomeLatestCollectionsSection.jsx'
import HomeInternationalShippingBanner from './pages/home/sections/HomeInternationalShippingBanner.jsx'
import HomeValentineSpecialSection from './pages/home/sections/HomeValentineSpecialSection.jsx'
import HomeCustomerStoriesSection from './pages/home/sections/HomeCustomerStoriesSection.jsx'
import heroBanner from '../assets/2048 × 626.jpg'
import promoBanner1 from '../assets/1312 × 668.jpg'
import promoBanner2 from '../assets/1312 × 668-2.jpg'
import productFallback from '../assets/876 × 1628-1.png'
import { getJson } from '../AdminPanel/services/apiClient.js'

const getPriceAmount = (p) => {
  const raw = typeof p === 'object' && p !== null ? p.amount : p
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

const pickPrimaryVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : []
  if (!variants.length) return null
  const active = variants.find((v) => v?.isActive !== false)
  return active || variants[0]
}

const Index = () => {
  const [bestSellers, setBestSellers] = useState([])

  useEffect(() => {
    let active = true
    getJson('/api/products', { page: 1, limit: 12 })
      .then((res) => {
        if (!active) return
        const rows = Array.isArray(res?.data) ? res.data : []
        const mapped = rows.slice(0, 8).map((p, idx) => {
          const v = pickPrimaryVariant(p) || {}
          const images = [p?.image, ...(Array.isArray(p?.images) ? p.images : []), v?.image, ...(Array.isArray(v?.images) ? v.images : [])].filter(
            Boolean
          )
          const cover = images[0] || productFallback
          const price = getPriceAmount(p?.makingCost) + getPriceAmount(p?.otherCharges) || getPriceAmount(v?.makingCost) + getPriceAmount(v?.otherCharges)

          return {
            id: p?._id,
            showBestseller: idx < 2,
            images: images.length ? images : [cover],
            imageUrl: cover,
            rating: undefined,
            ratingCount: undefined,
            price: Number.isFinite(price) ? price : 0,
            originalPrice: undefined,
            title: p?.name || 'Product',
            couponText: '',
          }
        })
        setBestSellers(mapped)
      })
      .catch(() => {
        if (!active) return
        setBestSellers([])
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto px-4 py-6">
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-[50px] bg-gray-100">
          <img
            src={heroBanner}
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
              src={promoBanner1}
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
              src={promoBanner2}
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
        {bestSellers.length ? (
          <div className="mx-auto max-w-[92vw]">
            <BestSellerPanel products={bestSellers} />
          </div>
        ) : null}
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

export default Index
