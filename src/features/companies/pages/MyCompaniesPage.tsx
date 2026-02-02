import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companyService } from '../services/companyService';
import { Company } from '@/types';
import { Building2, Plus, MapPin, Users, Globe, ExternalLink, Trash2, Settings } from 'lucide-react';

export function MyCompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getMyCompanies();
      setCompanies(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        const errorDetail = err.response?.data?.detail;
        const errorMessage = Array.isArray(errorDetail)
          ? errorDetail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
          : typeof errorDetail === 'string'
          ? errorDetail
          : 'Failed to load companies';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingCompanyId(companyId);
      await companyService.deleteCompany(companyId);
      setCompanies(companies.filter(company => company.id !== companyId));
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail;
      const errorMessage = typeof errorDetail === 'string'
        ? errorDetail
        : 'Failed to delete company';
      alert(errorMessage);
    } finally {
      setDeletingCompanyId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCompanies}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Companies</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your companies and post jobs
              </p>
            </div>
            <Link
              to="/companies/create"
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Create Company</span>
            </Link>
          </div>
        </div>

        {/* Companies List */}
        {companies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No companies yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first company to start posting jobs
            </p>
            <Link
              to="/companies/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Company
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col relative"
              >
                {/* Action buttons */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2 z-10">
                  <Link
                    to={`/companies/${company.id}/edit`}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="Edit company"
                    title="Edit company"
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteCompany(company.id)}
                    disabled={deletingCompanyId === company.id}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete company"
                    title="Delete company"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>

                <div className="flex items-start justify-between mb-3 sm:mb-4 pr-16 sm:pr-20">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {company.name}
                    </h3>
                    {company.industry && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{company.industry}</p>
                    )}
                  </div>
                  {company.logo && (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover ml-2 sm:ml-3 flex-shrink-0 border border-gray-200"
                    />
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 flex-1">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{company.location}</span>
                  </div>
                  {company.size && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-400 flex-shrink-0" />
                      <span>{company.size} employees</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-400 flex-shrink-0" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                {company.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-3 sm:mb-4">
                    {company.description}
                  </p>
                )}

                <div className="flex gap-2 mt-auto">
                  <Link
                    to={`/jobs/create?companyId=${company.id}`}
                    className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center text-xs sm:text-sm"
                  >
                    Post Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
