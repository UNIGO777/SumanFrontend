import { deleteJson, getJson, postJson, putJson, getApiBase, requestForm } from './apiClient.js'

export const listProducts = async ({ page, limit, q } = {}) => {
  return getJson('/api/products', { page, limit, q })
}

export const createProduct = async (data) => {
  return postJson('/api/products', data)
}

export const updateProduct = async (id, data) => {
  return putJson(`/api/products/${id}`, data)
}

export const deleteProduct = async (id) => {
  return deleteJson(`/api/products/${id}`)
}

export const previewBulkUpload = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return requestForm({ path: '/api/products/bulk?preview=true', formData })
}

export const bulkUploadProducts = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return requestForm({ path: '/api/products/bulk', formData })
}

export const downloadBulkTemplate = async () => {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('admin_token') || window.sessionStorage.getItem('admin_token') || ''
      : ''
  const res = await fetch(`${getApiBase()}/api/products/bulk-template`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if (!res.ok) throw new Error('Failed to download template')
  return res.blob()
}

