// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type UserRole = 'user' | 'employer' | 'admin'

// Job types
export interface Job {
  id: string
  title: string
  description: string
  company: Company
  location: string
  salary?: {
    min: number
    max: number
    currency: string
  }
  type: JobType
  status: JobStatus
  requirements: string[]
  createdAt: string
  updatedAt: string
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote'
export type JobStatus = 'active' | 'closed' | 'draft'

// Company types
export interface Company {
  id: string
  name: string
  description?: string
  logo?: string
  website?: string
  location: string
  industry?: string
  size?: CompanySize
  createdAt: string
  updatedAt: string
}

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+'

// Profile types
export interface Profile {
  id: string
  user: User
  title?: string
  bio?: string
  skills: string[]
  experience: Experience[]
  education: Education[]
  createdAt: string
  updatedAt: string
}

export interface Experience {
  id: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
}

export interface Education {
  id: string
  school: string
  degree: string
  field?: string
  startDate: string
  endDate?: string
  current: boolean
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
