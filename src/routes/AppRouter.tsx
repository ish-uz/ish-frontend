import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, NotFoundPage, DashboardPage } from '@/pages';
import {
  LoginPage,
  RegisterPage,
  ProfileSetupPage,
  VerifyEmailPage,
  ForgotPasswordPage,
} from '@/features/auth/pages';
import { JobsPage, JobDetailsPage, CreateJobPage, EditJobPage, MyJobsPage, SavedJobsPage } from '@/features/jobs/pages';
import { PostsPage, PostDetailsPage, CreatePostPage, EditPostPage, MyPostsPage } from '@/features/posts/pages';
import { ServicesPage, ServiceDetailsPage, CreateServicePage, EditServicePage, MyServicesPage } from '@/features/services/pages';
import { EmployeesPage, InvitationsPage } from '@/features/users/pages';
import { ProfileSettingsPage, ProfileViewPage } from '@/features/profiles/pages';
import { MyApplicationsPage, JobApplicationsPage } from '@/features/applications/pages';
import { CreateCompanyPage, MyCompaniesPage, EditCompanyPage } from '@/features/companies/pages';
import { ChatsPage, ChatPage } from '@/features/chat';
import { NotificationsPage } from '@/features/notifications/pages';
import { DashboardLayout } from '@/components/layouts';

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path='/' element={<HomePage />} />
      
      {/* Auth routes */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/profile-setup' element={<ProfileSetupPage />} />

      {/* Redirects from old/marketing URLs to existing routes */}
      <Route path='/employers' element={<Navigate to="/employees" replace />} />
      <Route path='/employers/post' element={<Navigate to="/jobs/create" replace />} />
      <Route path='/employers/pricing' element={<Navigate to="/" replace />} />
      <Route path='/freelancers' element={<Navigate to="/services" replace />} />
      <Route path='/freelancers/services' element={<Navigate to="/services" replace />} />
      <Route path='/freelancers/support' element={<Navigate to="/" replace />} />
      <Route path='/about' element={<Navigate to="/" replace />} />
      <Route path='/how-it-works' element={<Navigate to="/" replace />} />
      <Route path='/contact' element={<Navigate to="/" replace />} />
      <Route path='/privacy' element={<Navigate to="/" replace />} />
      <Route path='/terms' element={<Navigate to="/" replace />} />
      <Route path='/cookies' element={<Navigate to="/" replace />} />

      {/* Dashboard routes - with sidebar */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfileViewPage />} />
        <Route path="/profile/:id" element={<ProfileViewPage />} />
        <Route path="/profile/settings" element={<ProfileSettingsPage />} />
        
        {/* Jobs */}
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/create" element={<CreateJobPage />} />
        <Route path="/jobs/my" element={<MyJobsPage />} />
        <Route path="/jobs/saved" element={<SavedJobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/jobs/:id/edit" element={<EditJobPage />} />

        {/* Services */}
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/create" element={<CreateServicePage />} />
        <Route path="/services/my" element={<MyServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path="/services/:id/edit" element={<EditServicePage />} />

        {/* Posts */}
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/create" element={<CreatePostPage />} />
        <Route path="/posts/my" element={<MyPostsPage />} />
        <Route path="/posts/:id" element={<PostDetailsPage />} />
        <Route path="/posts/:id/edit" element={<EditPostPage />} />
        
        {/* Applications */}
        <Route path="/applications" element={<MyApplicationsPage />} />
        <Route path="/jobs/:id/applications" element={<JobApplicationsPage />} />
        
        {/* Employees */}
        <Route path="/employees" element={<EmployeesPage />} />
        
        {/* Companies */}
        <Route path="/companies" element={<MyCompaniesPage />} />
        <Route path="/companies/create" element={<CreateCompanyPage />} />
        <Route path="/companies/:id/edit" element={<EditCompanyPage />} />
        
        {/* Chat */}
        <Route path="/chat" element={<ChatsPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/invitations" element={<InvitationsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* 404 */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}
