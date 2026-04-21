import { getJson, putJson } from './apiClient.js'

export const fetchStats = (range = 'all') =>
  getJson('/api/admin/stats', { range }, { noCache: true })

export const fetchLowStockProducts = () =>
  getJson('/api/admin/products/low-stock', undefined, { noCache: true })

export const updateSilverPrice = (pricePerGram) =>
  putJson('/api/admin/prices/silver-925', { pricePerGram: Number(pricePerGram), currency: 'INR' })
