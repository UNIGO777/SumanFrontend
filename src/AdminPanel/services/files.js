import { requestForm } from './apiClient.js'

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return requestForm({ path: '/api/files/image', formData })
}

export const uploadImages = async (files) => {
  const formData = new FormData()
  Array.from(files || []).forEach((f) => formData.append('images', f))
  return requestForm({ path: '/api/files/images', formData })
}

export const uploadVideo = async (file) => {
  const formData = new FormData()
  formData.append('video', file)
  return requestForm({ path: '/api/files/video', formData })
}

