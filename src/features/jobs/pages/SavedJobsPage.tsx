import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jobService } from '../services/jobService';
import { Pagination } from '@/components/ui/Pagination';
import { Job } from '@/types';
import { getJobImageUrl } from '@/utils';
import { BookmarkCheck, MapPin, DollarSign, Clock, Building2, Trash2, Briefcase } from 'lucide-react';

export function SavedJobsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadSavedJobs();
  }, [currentPage]);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (currentPage - 1) * itemsPerPage;
      const result = await jobService.getSavedJobs(skip, itemsPerPage);
      setJobs(result.jobs);
      setTotalItems(result.total);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        const errorDetail = err.response?.data?.detail;
        const errorMessage = Array.isArray(errorDetail)
          ? errorDetail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
          : typeof errorDetail === 'string'
          ? errorDetail
          : t('pages.savedJobs.failedToLoad');
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: number) => {
    try {
      await jobService.unsaveJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err: any) {
      console.error('Failed to unsave job:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.savedJobs.loading')}</p>
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
            onClick={loadSavedJobs}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('pages.jobs.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BookmarkCheck className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('pages.savedJobs.title')}</h1>
          </div>
          <p className="text-gray-600">
            {t('pages.savedJobs.subtitle')}
          </p>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookmarkCheck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('pages.savedJobs.noSaved')}
            </h3>
            <p className="text-gray-500 mb-4">
              {t('pages.savedJobs.noSavedDesc')}
            </p>
            <Link
              to="/jobs"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('pages.savedJobs.browseJobs')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col relative"
              >
                {/* Unsave button */}
                <button
                  onClick={() => handleUnsave(job.id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={t('pages.savedJobs.unsave')}
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                <div className="flex items-start justify-between mb-4 pr-8">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getJobImageUrl(job) ? (
                      <img
                        src={getJobImageUrl(job)}
                        alt={job.company?.name || t('pages.jobs.company')}
                        className="h-12 w-12 rounded-xl object-cover flex-shrink-0 border border-gray-200 bg-slate-50"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                        <Briefcase className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {job.company?.name || 
                           (job.author ? `${job.author.firstName} ${job.author.lastName}` : t('pages.jobs.company'))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>
                        {job.salaryMin && job.salaryMax
                          ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                          : job.salaryMin
                          ? `${t('pages.jobDetails.from')} ${job.salaryMin.toLocaleString()}`
                          : `${t('pages.jobDetails.upTo')} ${job.salaryMax?.toLocaleString()}`
                        }{' '}
                        {job.salaryCurrency}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {job.description}
                </p>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">{t('pages.jobs.keyRequirements')}</p>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.slice(0, 3).map((req, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {t('pages.jobs.more', { count: job.requirements.length - 3 })}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  to={`/jobs/${job.id}`}
                  className="w-full mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
                >
                  {t('pages.jobs.viewDetails')}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
    </div>
  );
}
