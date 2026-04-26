import { getJson, postJson } from './apiClient.js'

export const adminLoginInit = async ({ email, password }) => {
  return postJson('/api/admin/login/init', { email, password })
}

export const adminLoginVerify = async ({ email, otp, keepLoggedIn }) => {
  return postJson('/api/admin/login/verify', { email, otp, keepLoggedIn: Boolean(keepLoggedIn) })
}

export const adminMe = async () => {
  return getJson('/api/admin/me')
}
