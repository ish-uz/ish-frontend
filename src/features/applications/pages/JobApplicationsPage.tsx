import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, User, Calendar, FileText, Mail, Phone,
  CheckCircle2, XCircle, Clock, Eye, AlertCircle, Briefcase, MessageCircle
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { jobService } from '@/features/jobs/services/jobService';
import { getUploadsUrl } from '@/lib/utils';
import { Application, Job } from '@/types';

export function JobApplicationsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadJob();
      loadApplications();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const data = await jobService.getJob(id!);
      setJob(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.jobApplications.failedToLoadJob'));
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getJobApplications(Number(id));
      setApplications(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError(t('pages.jobApplications.noPermission'));
      } else {
        setError(err.response?.data?.detail || t('pages.jobApplications.failedToLoad'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: number, newStatus: 'accepted' | 'rejected' | 'reviewed') => {
    try {
      const result = await applicationService.updateApplication(applicationId, { status: newStatus });
      
      // If accepted and conversation was created, navigate to chat
      if (newStatus === 'accepted' && result.conversationId) {
        navigate(`/chat/${result.conversationId}`);
        return;
      }
      
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.jobApplications.failedToUpdate'));
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

  if (error && !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/jobs/my"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('pages.jobApplications.backToMyJobs')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/jobs/${id}`}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('pages.jobApplications.backToJob')}
          </Link>
          
          <div className="flex items-center space-x-3 mb-2">
            <Briefcase className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                {t('pages.jobApplications.applicationsFor', { jobTitle: job?.title || 'Job' })}
              </h1>
              <p className="text-slate-600 text-sm lg:text-base">
                {t('pages.jobApplications.subtitle')}
              </p>
            </div>
          </div>
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
            <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('pages.jobApplications.noApplicationsYet')}</h3>
            <p className="text-slate-600 mb-6">
              {t('pages.jobApplications.noApplicationsDesc')}
            </p>
            <Link
              to={`/jobs/${id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Briefcase className="h-5 w-5" />
              {t('pages.jobApplications.viewJobPosting')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusBadge = getStatusBadge(application.status);
              const applicant = application.applicant;
              
              return (
                <div
                  key={application.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Applicant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          {applicant?.avatar ? (
                            <img
                              src={getUploadsUrl(applicant.avatar)}
                              alt={applicant.firstName}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          ) : (
                            <span className="text-white text-xl font-semibold">
                              {applicant?.firstName?.[0]}{applicant?.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/profile/${applicant?.id}`}
                            className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors block"
                          >
                            {applicant?.firstName} {applicant?.lastName}
                          </Link>
                          {applicant?.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <Mail className="h-4 w-4" />
                              <span>{applicant.email}</span>
                            </div>
                          )}
                          {applicant?.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <Phone className="h-4 w-4" />
                              <span>{applicant.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                            <Calendar className="h-4 w-4" />
                            <span>{t('pages.jobApplications.applied')} {formatDate(application.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.icon}
                        {getStatusLabel(application.status)}
                      </span>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, 'reviewed')}
                              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              {t('pages.jobApplications.markAsReviewed')}
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'accepted')}
                              className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              {t('pages.jobApplications.accept')}
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              {t('pages.jobApplications.reject')}
                            </button>
                          </>
                        )}
                        {application.status === 'reviewed' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, 'accepted')}
                              className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              {t('pages.jobApplications.accept')}
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              {t('pages.jobApplications.reject')}
                            </button>
                          </>
                        )}
                        {application.status === 'accepted' && application.conversationId && (
                          <Link
                            to={`/chat/${application.conversationId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {t('pages.jobApplications.openChat')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {application.coverLetter && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <p className="text-sm font-medium text-slate-700">Cover Letter</p>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-line">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* View Profile Link */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Link
                      to={`/profile/${applicant?.id}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <User className="h-4 w-4" />
                      {t('pages.jobApplications.viewFullProfile')}
                    </Link>
                  </div>
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
              <p className="text-sm text-slate-500">{t('pages.jobApplications.totalApplications')}</p>
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
