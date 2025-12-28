import { deleteJson, getJson, postJson, putJson } from './apiClient.js'

export const listSubcategories = async ({ page, limit, q, isActive, categoryId } = {}) => {
  return getJson('/api/subcategories', { page, limit, q, isActive, categoryId })
}

export const createSubcategory = async ({ name, description, isActive, categoryId }) => {
  return postJson('/api/subcategories', { name, description, isActive, categoryId })
}

export const updateSubcategory = async (id, data) => {
  return putJson(`/api/subcategories/${id}`, data)
}

export const deleteSubcategory = async (id) => {
  return deleteJson(`/api/subcategories/${id}`)
}

