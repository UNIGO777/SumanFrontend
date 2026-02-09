import { getJson, putJson } from './apiClient.js'

export const listOccasions = async () => {
  const res = await getJson('/api/admin/occasions')
  return Array.isArray(res?.data) ? res.data : []
}

export const getOccasion = async (key) => {
  const safe = encodeURIComponent(String(key || '').trim())
  const res = await getJson(`/api/admin/occasions/${safe}`)
  return res?.data || null
}

export const upsertOccasion = async (key, data) => {
  const safe = encodeURIComponent(String(key || '').trim())
  const res = await putJson(`/api/admin/occasions/${safe}`, data)
  return res?.data || null
}
