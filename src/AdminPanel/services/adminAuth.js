import { postJson } from './apiClient.js'

export const adminLoginInit = async ({ email, password }) => {
  return postJson('/api/admin/login/init', { email, password })
}

export const adminLoginVerify = async ({ email, otp }) => {
  return postJson('/api/admin/login/verify', { email, otp })
}
