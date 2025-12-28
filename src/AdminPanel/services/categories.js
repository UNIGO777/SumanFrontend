import { deleteJson, getJson, postJson, putJson } from './apiClient.js'

export const listCategories = async ({ page, limit, q, isActive } = {}) => {
  return getJson('/api/categories', { page, limit, q, isActive })
}

export const createCategory = async ({ name, description, isActive }) => {
  return postJson('/api/categories', { name, description, isActive })
}

export const updateCategory = async (id, data) => {
  return putJson(`/api/categories/${id}`, data)
}

export const deleteCategory = async (id) => {
  return deleteJson(`/api/categories/${id}`)
}

