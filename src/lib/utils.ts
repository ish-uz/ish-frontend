import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const uploadsBase =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'

/** Full URL for an uploaded file (avatar, CV, etc.). Accepts relative path or full URL (e.g. R2). */
export function getUploadsUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return ''
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
  return `${uploadsBase}/uploads/${pathOrUrl}`
}
