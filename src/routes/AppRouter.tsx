import { Routes, Route } from 'react-router-dom';
import { HomePage, NotFoundPage, DashboardPage } from '@/pages';
import {
  LoginPage,
  RegisterPage,
  ProfileSetupPage,
} from '@/features/auth/pages';
import { JobsPage, JobDetailsPage, CreateJobPage, MyJobsPage } from '@/features/jobs/pages';
import { EmployeesPage } from '@/features/users/pages';
import { ProfileSettingsPage, ProfileViewPage } from '@/features/profiles/pages';
import { MyApplicationsPage, JobApplicationsPage } from '@/features/applications/pages';
import { DashboardLayout } from '@/components/layouts';

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path='/' element={<HomePage />} />
      
      {/* Auth routes */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/profile-setup' element={<ProfileSetupPage />} />

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
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        
        {/* Applications */}
        <Route path="/applications" element={<MyApplicationsPage />} />
        <Route path="/jobs/:id/applications" element={<JobApplicationsPage />} />
        
        {/* Employees */}
        <Route path="/employees" element={<EmployeesPage />} />
        
        {/* Companies */}
        {/* <Route path="/companies" element={<CompaniesPage />} /> */}
      </Route>

      {/* 404 */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}
