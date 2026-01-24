// User roles
export const USER_ROLES = {
  USER: 'user',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
} as const

// Job types
export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  REMOTE: 'remote',
} as const

export const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'contract': 'Contract',
  'internship': 'Internship',
  'remote': 'Remote',
}

// Job statuses
export const JOB_STATUSES = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  DRAFT: 'draft',
} as const

export const JOB_STATUS_LABELS: Record<string, string> = {
  'active': 'Active',
  'closed': 'Closed',
  'draft': 'Draft',
}

// Company sizes
export const COMPANY_SIZES = {
  SMALL: '1-10',
  MEDIUM: '11-50',
  LARGE: '51-200',
  ENTERPRISE: '201-500',
  CORPORATION: '500+',
} as const

export const COMPANY_SIZE_LABELS: Record<string, string> = {
  '1-10': '1-10 employees',
  '11-50': '11-50 employees',
  '51-200': '51-200 employees',
  '201-500': '201-500 employees',
  '500+': '500+ employees',
}

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  EMPLOYEES: '/employees',
  PROFILES: '/profiles',
  PROFILE_DETAIL: '/profiles/:id',
  COMPANIES: '/companies',
  COMPANY_DETAIL: '/companies/:id',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
} as const
