import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText, MapPin, Calendar, Building2, Clock, CheckCircle2,
  XCircle, Eye, AlertCircle, Briefcase, Trash2
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { Application } from '@/types';

export function MyApplicationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || t('pages.myApplications.failedToLoad'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm(t('pages.myApplications.confirmWithdraw'))) return;
    
    try {
      await applicationService.withdrawApplication(id);
      setApplications(applications.filter(app => app.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.myApplications.failedToWithdraw'));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: <Clock className="h-4 w-4" />,
      },
      reviewed: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: <Eye className="h-4 w-4" />,
      },
      accepted: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <XCircle className="h-4 w-4" />,
      },
    };
    return badges[status] || badges.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('pages.myApplications.statusPending'),
      reviewed: t('pages.myApplications.statusReviewed'),
      accepted: t('pages.myApplications.statusAccepted'),
      rejected: t('pages.myApplications.statusRejected'),
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('pages.myApplications.title')}</h1>
          </div>
          <p className="text-slate-600 text-sm lg:text-base">
            {t('pages.myApplications.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-12 text-center">
            <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('pages.myApplications.noApplications')}</h3>
            <p className="text-slate-600 mb-6">
              {t('pages.myApplications.noApplicationsDesc')}
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Briefcase className="h-5 w-5" />
              {t('pages.myApplications.browseJobs')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusBadge = getStatusBadge(application.status);
              return (
                <div
                  key={application.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/jobs/${application.jobId}`}
                            className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors block truncate"
                          >
                            {application.job?.title || `Job #${application.jobId}`}
                          </Link>
                          <p className="text-slate-600 text-sm">
                            {application.job?.company?.name || 'Company'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                            {application.job?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {application.job.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {t('pages.myApplications.applied')} {formatDate(application.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.icon}
                        {getStatusLabel(application.status)}
                      </span>
                      
                      {application.status === 'pending' && (
                        <button
                          onClick={() => handleWithdraw(application.id)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('pages.myApplications.withdraw')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  {application.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500 mb-1">{t('pages.myApplications.coverLetter')}</p>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {applications.length > 0 && (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
              <p className="text-sm text-slate-500">{t('pages.myApplications.totalApplied')}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {applications.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-500">{t('pages.myApplications.statusPending')}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {applications.filter(a => a.status === 'reviewed').length}
              </p>
              <p className="text-sm text-slate-500">{t('pages.myApplications.statusReviewed')}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(a => a.status === 'accepted').length}
              </p>
              <p className="text-sm text-slate-500">{t('pages.myApplications.statusAccepted')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
