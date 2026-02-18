import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const uploadsBase =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000'

/** Full URL for an uploaded file (avatar, CV, etc.) by relative path. */
export function getUploadsUrl(relativePath: string): string {
  return `${uploadsBase}/uploads/${relativePath}`
}
