import { postJson } from './apiClient.js'

export const sendMail = async ({ to, subject, text, html }) => {
  return postJson('/api/mail/send', { to, subject, text, html })
}

export const contactMail = async ({ name, email, message }) => {
  return postJson('/api/mail/contact', { name, email, message })
}
