import { treaty } from '@elysia/eden'
import type { App } from '@/app/api/[[...slugs]]/route'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

// .api to enter /api prefix
export const api = treaty<App>(getBaseUrl()).api