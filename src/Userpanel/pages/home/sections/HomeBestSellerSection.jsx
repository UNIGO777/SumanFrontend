import BestSellerPanel from '../../../components/BestSellerPanel.jsx'
import { useEffect, useState } from 'react'
import productFallback from '../../../../assets/876 × 1628-1.png'
import { getJson } from '../../../../AdminPanel/services/apiClient.js'
import { computeProductPricing, getSilver925RatePerGram, getSilverWeightGrams } from '../../../UserServices/pricingService.js'

const pickPrimaryVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : []
  if (!variants.length) return null
  const active = variants.find((v) => v?.isActive !== false)
  return active || variants[0]
}

export default function HomeBestSellerSection() {
  const [apiProducts, setApiProducts] = useState([])

  useEffect(() => {
    let active = true

    Promise.all([getSilver925RatePerGram(), getJson('/api/products/bestsellers', { page: 1, limit: 12 })])
      .then(([rate, res]) => {
        if (!active) return
        const rows = Array.isArray(res?.data) ? res.data : []
        const mapped = rows.slice(0, 8).map((p) => {
          const v = pickPrimaryVariant(p) || {}
          const images = [p?.image, ...(Array.isArray(p?.images) ? p.images : []), v?.image, ...(Array.isArray(v?.images) ? v.images : [])].filter(
            Boolean
          )
          const cover = images[0] || productFallback
          const pricing = computeProductPricing(p, rate)
          const gramsNum = getSilverWeightGrams(p)
          return {
            id: p?._id,
            showBestseller: true,
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
    <div className="mt-12">
      <div className="mx-auto max-w-[92vw]">
        <BestSellerPanel
          title="Bestsellers"
          description="Top picks loved for their look, feel, and everyday sparkle."
          products={apiProducts}
        />
      </div>
    </div>
  )
}
