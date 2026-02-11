import { getJson, postJson, putJson } from './apiClient.js'

export const listAdminOrders = async ({ page, limit } = {}) => {
  return getJson('/api/admin/orders', { page, limit })
}

export const showAdminOrder = async (id) => {
  return getJson(`/api/admin/orders/${id}`)
}

export const shiprocketCreateForOrder = async (id) => {
  return postJson(`/api/admin/orders/${id}/shiprocket/create`, {})
}

export const shiprocketGeneratePickup = async (id) => {
  return postJson(`/api/admin/orders/${id}/shiprocket/pickup`, {})
}

export const shiprocketGenerateManifest = async (id) => {
  return postJson(`/api/admin/orders/${id}/shiprocket/manifest`, {})
}

export const shiprocketGenerateLabel = async (id) => {
  return postJson(`/api/admin/orders/${id}/shiprocket/label`, {})
}

export const shiprocketPrintInvoice = async (id) => {
  return postJson(`/api/admin/orders/${id}/shiprocket/invoice`, {})
}

export const shiprocketTrackAwb = async (id) => {
  return getJson(`/api/admin/orders/${id}/shiprocket/track`)
}

export const updateAdminOrderStatus = async (id, status) => {
  return putJson(`/api/admin/orders/${id}/status`, { status })
}
