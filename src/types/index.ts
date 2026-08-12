// User types
export interface User {
  id: number
  email: string
  phone?: string
  firstName: string
  lastName: string
  avatar?: string
  telegramId?: string | null
  role: UserRole
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 'user' | 'admin'

// Job types
export interface Job {
  id: number
  authorId: number
  companyId?: number
  title: string
  description: string
  location: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  jobType: JobType
  status: JobStatus
  requirements?: string[]
  isRemote: boolean
  image?: string
  viewsCount: number
  createdAt: string
  updatedAt: string
  // Populated fields
  company?: Company
  author?: User
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote'
export type JobStatus = 'active' | 'closed' | 'draft'

// Post types (news / company updates)
export interface Post {
  id: number
  authorId: number
  companyId?: number
  title: string
  content: string
  image?: string
  status: PostStatus
  likesCount: number
  liked?: boolean
  createdAt: string
  updatedAt: string
  company?: Company
  author?: User
}

export type PostStatus = 'draft' | 'published'

export interface PostCreate {
  title: string
  content: string
  companyId?: number | null
  status?: PostStatus
}

// Application types
export interface Application {
  id: number
  jobId: number
  applicantId: number
  coverLetter?: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  // Populated fields
  job?: Job
  applicant?: User
  conversationId?: number
}

export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'

// Company types
export interface Company {
  id: number
  ownerId: number
  name: string
  description?: string
  logo?: string
  website?: string
  location: string
  industry?: string
  size?: CompanySize
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+'

// Profile types
export interface Profile {
  id: number
  userId: number
  fullName: string
  city: string
  avatar?: string
  title?: string
  bio?: string
  skills?: string[]
  experience?: Experience[]
  education?: Education[]
  cvFile?: string
  employerInfo?: {
    businessType?: string
    neededEmployees?: string
  }
  freelancerInfo?: {
    services?: string[]
    portfolio?: any[]
    prices?: any
    previousWorks?: any[]
  }
  jobSeekerComplete: boolean
  employerComplete: boolean
  freelancerComplete: boolean
  isComplete: boolean
  openToJobSeeker: boolean
  openToEmployer: boolean
  createdAt: string
  updatedAt: string
}

export interface Experience {
  id?: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  description?: string
  current?: boolean
}

export interface Education {
  id?: string
  school: string
  degree: string
  field?: string
  startDate: string
  endDate?: string
  current?: boolean
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

// Create/Update types
export interface JobCreate {
  title: string
  description: string
  location: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  jobType: JobType
  requirements?: string[]
  isRemote?: boolean
  companyId?: number
}

export interface ApplicationCreate {
  jobId: number
  coverLetter?: string
}

// Chat types
export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Message {
  id: number
  conversationId: number
  senderId: number
  content: string
  status: MessageStatus
  createdAt: string
  readAt?: string
}

export interface ConversationParticipant {
  id: number
  firstName: string
  lastName: string
  avatar?: string
}

export interface Conversation {
  id: number
  applicationId?: number
  employerId: number
  applicantId: number
  createdAt: string
  updatedAt: string
  employer?: ConversationParticipant
  applicant?: ConversationParticipant
  lastMessage?: Message
  unreadCount: number
  jobTitle?: string
  jobId?: number
}

export interface ConversationListResponse {
  items: Conversation[]
  total: number
}

export interface MessageListResponse {
  items: Message[]
  total: number
  hasMore: boolean
}

// Chat invitation types
export interface InvitationParticipant {
  id: number
  firstName: string
  lastName: string
  avatar?: string
}

export interface ChatInvitation {
  id: number
  fromUserId: number
  toUserId: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  conversationId?: number
  createdAt: string
  fromUser?: InvitationParticipant
  toUser?: InvitationParticipant
}

export interface ChatWithUserResponse {
  conversation?: Conversation
  pendingInvitationFromMe?: ChatInvitation
  pendingInvitationFromThem?: ChatInvitation
}

// WebSocket message types
export type WSMessageType = 'new_message' | 'message_delivered' | 'message_read' | 'messages_read' | 'error'

export interface WSMessage {
  type: WSMessageType
  data: any
}
