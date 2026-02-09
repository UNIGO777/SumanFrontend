import { getJson } from '../../AdminPanel/services/apiClient.js'

const SILVER_925_PATH = '/api/prices/silver-925'

let cachedRate = { value: 0, fetchedAt: 0, promise: null }

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

const getAttrNumber = (attributes, key) => {
  if (!attributes || typeof attributes !== 'object') return 0
  const target = String(key || '').trim().toLowerCase()
  if (!target) return 0
  const entry = Object.entries(attributes).find(([k]) => String(k).trim().toLowerCase() === target)
  if (!entry) return 0
  const n = Number(entry[1])
  return Number.isFinite(n) && n > 0 ? n : 0
}

export const getSilverWeightGrams = (product) => {
  const v = pickPrimaryVariant(product) || {}
  const direct = Number(product?.silverWeightGrams)
  if (Number.isFinite(direct) && direct > 0) return direct
  const directLegacy = Number(product?.grams)
  if (Number.isFinite(directLegacy) && directLegacy > 0) return directLegacy
  const fromVariant = Number(v?.silverWeightGrams)
  if (Number.isFinite(fromVariant) && fromVariant > 0) return fromVariant
  const fromVariantLegacy = Number(v?.grams)
  if (Number.isFinite(fromVariantLegacy) && fromVariantLegacy > 0) return fromVariantLegacy
  const attrs = product?.attributes
  return (
    getAttrNumber(attrs, 'silverWeightGrams') ||
    getAttrNumber(attrs, 'silver_weight_grams') ||
    getAttrNumber(attrs, 'grams') ||
    getAttrNumber(attrs, 'gram') ||
    getAttrNumber(attrs, 'weight') ||
    getAttrNumber(attrs, 'weightGrams')
  )
}

export const computeProductBasePrice = (product) => {
  const v = pickPrimaryVariant(product) || {}
  const baseFromProduct = getPriceAmount(product?.makingCost) + getPriceAmount(product?.otherCharges)
  const baseFromVariant = getPriceAmount(v?.makingCost) + getPriceAmount(v?.otherCharges)
  return baseFromProduct > 0 ? baseFromProduct : baseFromVariant
}

export const getDiscountPercent = (product) => {
  const v = pickPrimaryVariant(product) || {}
  const rawVariant = Number(v?.discountPercent)
  if (Number.isFinite(rawVariant) && rawVariant > 0) return Math.min(100, Math.max(0, rawVariant))
  const rawProduct = Number(product?.discountPercent)
  if (Number.isFinite(rawProduct) && rawProduct > 0) return Math.min(100, Math.max(0, rawProduct))

  const attrs = product?.attributes
  const fromAttrs = getAttrNumber(attrs, 'discountPercent') || getAttrNumber(attrs, 'discount_percent')
  return fromAttrs ? Math.min(100, Math.max(0, fromAttrs)) : 0
}

export const computeProductPricing = (product, silverPricePerGram) => {
  const base = computeProductBasePrice(product)
  const weightGrams = getSilverWeightGrams(product)
  const rate = Number(silverPricePerGram)
  const silverAdd = Number.isFinite(rate) && rate > 0 ? weightGrams * rate : 0
  const originalTotal = base + silverAdd
  const original = Number.isFinite(originalTotal) ? originalTotal : 0
  const discountPercent = getDiscountPercent(product)
  const discounted = discountPercent > 0 ? original * (1 - discountPercent / 100) : original
  const price = Number.isFinite(discounted) ? discounted : 0

  return {
    price,
    originalPrice: discountPercent > 0 && original > price ? original : undefined,
    discountPercent,
  }
}

export const computeProductTotalPrice = (product, silverPricePerGram) => {
  return computeProductPricing(product, silverPricePerGram).price
}

export const getSilver925RatePerGram = async ({ maxAgeMs = 5 * 60 * 1000 } = {}) => {
  const now = Date.now()
  if (cachedRate.promise) return cachedRate.promise
  if (cachedRate.fetchedAt && now - cachedRate.fetchedAt < maxAgeMs) return cachedRate.value

  cachedRate.promise = getJson(SILVER_925_PATH)
    .then((res) => {
      const n = Number(res?.data?.pricePerGram)
      cachedRate.value = Number.isFinite(n) ? n : 0
      cachedRate.fetchedAt = Date.now()
      return cachedRate.value
    })
    .catch(() => {
      cachedRate.value = 0
      cachedRate.fetchedAt = Date.now()
      return 0
    })
    .finally(() => {
      cachedRate.promise = null
    })

  return cachedRate.promise
}
