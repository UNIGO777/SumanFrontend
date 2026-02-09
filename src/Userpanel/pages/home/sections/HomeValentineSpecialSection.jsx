import ProductCard from '../../../components/ProductCard.jsx'
import { useEffect, useState } from 'react'
import productFallback from '../../../../assets/876 × 1628-1.png'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'
import { computeProductPricing, getSilver925RatePerGram } from '../../../UserServices/pricingService.js'

const pickPrimaryVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : []
  if (!variants.length) return null
  const active = variants.find((v) => v?.isActive !== false)
  return active || variants[0]
}

export default function HomeValentineSpecialSection() {
  const [apiProducts, setApiProducts] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([getSilver925RatePerGram(), getJson('/api/products', { page: 1, limit: 12 })])
      .then(([rate, res]) => {
        if (!active) return
        const rows = Array.isArray(res?.data) ? res.data : []
        const mapped = rows.slice(0, 8).map((p, idx) => {
          const v = pickPrimaryVariant(p) || {}
          const images = [p?.image, ...(Array.isArray(p?.images) ? p.images : []), v?.image, ...(Array.isArray(v?.images) ? v.images : [])].filter(
            Boolean
          )
          const cover = images[0] || productFallback
          const pricing = computeProductPricing(p, rate)
          return {
            id: p?._id,
            showBestseller: idx < 3,
            images: images.length ? images : [cover],
            imageUrl: cover,
            price: Number.isFinite(pricing?.price) ? pricing.price : 0,
            originalPrice: Number.isFinite(pricing?.originalPrice) ? pricing.originalPrice : undefined,
            discountPercent: Number.isFinite(pricing?.discountPercent) ? pricing.discountPercent : 0,
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
    <div className="mt-14">
      <section className="w-full">
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-gray-900">Valentine&apos;s Special</div>
          <div className="mt-2 text-sm font-semibold text-gray-600">
            Romantic picks to gift, stack, and shine all season long.
          </div>
        </div>

        <div className="mx-auto max-w-[92vw]">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {apiProducts.map((p) => (
              <ProductCard
                key={p.id}
                {...p}
                className="max-w-none"
                cardHeightClassName="h-[460px]"
                imageHeightClassName="h-[240px]"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
