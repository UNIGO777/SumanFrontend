import { useEffect, useState } from 'react'
import productFallback from '../../../../assets/876 × 1628-1.png'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'
import { computeProductPricing, getSilver925RatePerGram, getSilverWeightGrams } from '../../../UserServices/pricingService.js'
import BestSellerPanel from '../../../components/BestSellerPanel.jsx'

const pickPrimaryVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : []
  if (!variants.length) return null
  const active = variants.find((v) => v?.isActive !== false)
  return active || variants[0]
}

export default function HomeMostGiftedSection() {
  const [apiProducts, setApiProducts] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([getSilver925RatePerGram(), getJson('/api/products/most-gifted', { page: 1, limit: 12 })])
      .then(([rate, res]) => {
        if (!active) return
        const rows = Array.isArray(res?.data) ? res.data : []
        const mapped = rows.slice(0, 6).map((p) => {
          const v = pickPrimaryVariant(p) || {}
          const images = [p?.image, ...(Array.isArray(p?.images) ? p.images : []), v?.image, ...(Array.isArray(v?.images) ? v.images : [])].filter(
            Boolean
          )
          const cover = images[0] || productFallback
          const pricing = computeProductPricing(p, rate)
          const gramsNum = getSilverWeightGrams(p)
          return {
            id: p?._id,
            images: images.length ? images : [cover],
            imageUrl: cover,
            price: Number.isFinite(pricing?.price) ? pricing.price : 0,
            originalPrice: Number.isFinite(pricing?.originalPrice) ? pricing.originalPrice : undefined,
            discountPercent: Number.isFinite(pricing?.discountPercent) ? pricing.discountPercent : 0,
            silverWeightGrams: gramsNum || undefined,
            title: p?.name || 'Product',
            couponText: '',
          }
        })
        setApiProducts(mapped)
      })
      .catch(() => {
        if (!active) return
        setApiProducts([])
      })
    return () => {
      active = false
    }
  }, [])

  if (!apiProducts.length) return null

  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="w-full px-4 md:px-10">
          <BestSellerPanel
            title="Most Gifted"
            description="Crowd favourites that make gifting effortless and memorable."
            products={apiProducts}
            autoScroll
          />

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="rounded-full border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            >
              View More
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
