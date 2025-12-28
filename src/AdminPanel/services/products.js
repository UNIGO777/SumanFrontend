import { deleteJson, getJson, postJson, putJson } from './apiClient.js'

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

