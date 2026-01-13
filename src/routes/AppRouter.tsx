import { Routes, Route } from 'react-router-dom';
import { HomePage, NotFoundPage } from '@/pages';

export function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      {/* Auth routes */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}

      {/* Jobs routes */}
      {/* <Route path="/jobs" element={<JobsPage />} /> */}
      {/* <Route path="/jobs/:id" element={<JobDetailPage />} /> */}

      {/* Profiles routes */}
      {/* <Route path="/profiles" element={<ProfilesPage />} /> */}
      {/* <Route path="/profiles/:id" element={<ProfileDetailPage />} /> */}

      {/* Companies routes */}
      {/* <Route path="/companies" element={<CompaniesPage />} /> */}
      {/* <Route path="/companies/:id" element={<CompanyDetailPage />} /> */}

      {/* 404 */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}
