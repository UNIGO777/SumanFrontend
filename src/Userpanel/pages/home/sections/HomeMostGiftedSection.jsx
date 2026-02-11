import { useEffect, useState } from 'react'
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
  const [cms, setCms] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    const run = async () => {
      setLoading(true)
      try {
        const [rate, res] = await Promise.all([getSilver925RatePerGram(), getJson('/api/products/most-gifted', { page: 1, limit: 12 })])
        if (!active) return
        const rows = Array.isArray(res?.data) ? res.data : []
        const mapped = rows.slice(0, 6).map((p) => {
          const v = pickPrimaryVariant(p) || {}
          const images = [
            p?.image,
            ...(Array.isArray(p?.images) ? p.images : []),
            v?.image,
            ...(Array.isArray(v?.images) ? v.images : []),
          ].filter(Boolean)
          const pricing = computeProductPricing(p, rate)
          const gramsNum = getSilverWeightGrams(p)
          return {
            id: p?._id,
            images,
            imageUrl: images[0] || '',
            price: Number.isFinite(pricing?.price) ? pricing.price : 0,
            originalPrice: Number.isFinite(pricing?.originalPrice) ? pricing.originalPrice : undefined,
            discountPercent: Number.isFinite(pricing?.discountPercent) ? pricing.discountPercent : 0,
            silverWeightGrams: gramsNum || undefined,
            title: String(p?.name || '').trim(),
            couponText: '',
          }
        })
        setApiProducts(mapped)
      } catch {
        if (!active) return
        setApiProducts([])
      }

      try {
        const cmsRes = await getJson('/api/cms/home-most-gifted')
        if (!active) return
        setCms(cmsRes?.data || null)
      } catch {
        if (!active) return
        setCms(null)
      }
      if (!active) return
      setLoading(false)
      setLoaded(true)
    }

    run()
    return () => {
      active = false
    }
  }, [])

  const title = String(cms?.title || '').trim()
  const description = String(cms?.description || '').trim()

  if (loading && !loaded) {
    return (
      <div className="mt-10 animate-pulse">
        <section className="relative w-full">
          <div className="w-full px-4 md:px-10">
            <div className="mb-6 text-center">
              <div className="mx-auto h-9 w-56 rounded bg-gray-200 sm:h-10 md:h-12" />
              <div className="mx-auto mt-2 h-4 w-96 rounded bg-gray-200 sm:h-5" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:hidden">
              {[0, 1, 2, 3].map((k) => (
                <div key={k} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <div className="h-[120px] bg-gray-200" />
                  <div className="space-y-2 p-3">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>

            <div className="no-scrollbar hidden gap-8 overflow-x-auto px-1 py-2 sm:flex">
              {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} className="w-[260px] shrink-0 md:w-[420px]">
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="h-[240px] bg-gray-200 md:h-[320px]" />
                    <div className="space-y-2 p-4">
                      <div className="h-5 w-3/4 rounded bg-gray-200" />
                      <div className="h-5 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!apiProducts.length) return null

  return (
    <div className="mt-10">
      <section className="w-full">
        <div className="w-full px-4 md:px-10">
          <BestSellerPanel
            title={title}
            description={description}
            products={apiProducts}
            autoScroll
          />
        </div>
      </section>
    </div>
  )
}
