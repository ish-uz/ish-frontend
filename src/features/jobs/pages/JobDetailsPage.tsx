import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, MapPin, Briefcase, DollarSign, Eye, Building2,
  Calendar, CheckCircle2, Send, X, User, Globe, Users, Bookmark, BookmarkCheck
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { applicationService } from '@/features/applications/services/applicationService';
import { userService } from '@/features/users/services/userService';
import { Application, Job, User as UserType } from '@/types';
import { getJobImageUrl } from '@/utils';

const JOB_TYPE_KEYS: Record<string, string> = {
  'full-time': 'fullTime',
  'part-time': 'partTime',
  'contract': 'contract',
  'internship': 'internship',
  'remote': 'remote',
};

const APPLICATION_STATUS_KEYS: Record<string, string> = {
  pending: 'statusPending',
  reviewed: 'statusReviewed',
  accepted: 'statusAccepted',
  rejected: 'statusRejected',
};

export function JobDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null);
  const viewsIncrementedRef = useRef<string | null>(null);
  
  // Apply modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  
  // Save job state
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      // Reset views increment flag when job ID changes
      if (viewsIncrementedRef.current !== id) {
        viewsIncrementedRef.current = null;
      }
      loadJob();
      loadCurrentUser();
      checkIfSaved();
    }
    
    // Cleanup: reset loading flag when component unmounts or id changes
    return () => {
      if (loadingRef.current === id) {
        loadingRef.current = null;
      }
    };
  }, [id]);

  const loadJob = async () => {
    // Prevent double loading for the same job ID
    if (loadingRef.current === id) {
      return;
    }
    
    try {
      loadingRef.current = id!;
      setLoading(true);
      const data = await jobService.getJob(id!);
      setJob(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.jobDetails.failedToLoad'));
    } finally {
      setLoading(false);
      // Only reset if this is still the current job being loaded
      if (loadingRef.current === id) {
        loadingRef.current = null;
      }
    }
  };

  // Increment views (backend will check if user is owner)
  useEffect(() => {
    if (!job || !id) return;
    
    // Don't increment if already incremented for this job
    if (viewsIncrementedRef.current === id) return;
    
    // Increment views (backend handles owner check)
    viewsIncrementedRef.current = id;
    jobService.incrementViews(Number(id)).catch((err) => {
      // Silently fail - views increment is not critical
      console.error('Failed to increment views:', err);
    });
  }, [job, id]);

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
      }
    } catch (err) {
      // User not logged in or error - that's ok
      setCurrentUser(null);
    }
  };

  const checkIfSaved = async () => {
    if (!id) return;
    try {
      const saved = await jobService.checkJobSaved(Number(id));
      setIsSaved(saved);
    } catch (err) {
      // User not logged in or error - that's ok
      setIsSaved(false);
    }
  };

  // When job is loaded and user is logged in (and not owner), check if already applied
  useEffect(() => {
    if (!id || !job || !currentUser || currentUser.id === job.authorId) {
      return;
    }
    applicationService.getMyApplicationForJob(Number(id)).then((app) => {
      if (app) {
        setApplied(true);
        setExistingApplication(app);
      } else {
        setApplied(false);
        setExistingApplication(null);
      }
    }).catch(() => {
      setApplied(false);
      setExistingApplication(null);
    });
  }, [id, job, currentUser]);

  const handleSaveJob = async () => {
    if (!id || !currentUser) {
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      if (isSaved) {
        await jobService.unsaveJob(Number(id));
        setIsSaved(false);
      } else {
        await jobService.saveJob(Number(id));
        setIsSaved(true);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        console.error('Failed to save/unsave job:', err);
      }
    } finally {
      setSaving(false);
    }
  };

  const isJobOwner = currentUser && job && currentUser.id === job.authorId;

  const handleApply = async () => {
    if (!job) return;
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      setApplyError(null);
      await applicationService.applyToJob({
        jobId: job.id,
        coverLetter: coverLetter || undefined,
      });
      setApplied(true);
      setShowApplyModal(false);
      setCoverLetter('');
      const app = await applicationService.getMyApplicationForJob(job.id);
      if (app) setExistingApplication(app);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setApplied(true);
        setShowApplyModal(false);
        setApplyError(null);
        applicationService.getMyApplicationForJob(job.id).then((app) => {
          if (app) setExistingApplication(app);
        }).catch(() => {});
      } else {
        setApplyError(err.response?.data?.detail || t('pages.jobDetails.failedToSubmit'));
      }
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'UZS') => {
    if (!min && !max) return t('pages.jobDetails.salaryNotSpecified');
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    }
    if (min) return `${t('pages.jobDetails.from')} ${min.toLocaleString()} ${currency}`;
    if (max) return `${t('pages.jobDetails.upTo')} ${max.toLocaleString()} ${currency}`;
    return t('pages.jobDetails.salaryNotSpecified');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getJobTypeLabel = (type: string) => {
    const key = JOB_TYPE_KEYS[type];
    return key ? t(`pages.jobType.${key}`) : type;
  };

  const getJobTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-blue-100 text-blue-700',
      'part-time': 'bg-purple-100 text-purple-700',
      'contract': 'bg-orange-100 text-orange-700',
      'internship': 'bg-green-100 text-green-700',
      'remote': 'bg-teal-100 text-teal-700',
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-32"></div>
            <div className="bg-white rounded-2xl p-6">
              <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || t('pages.jobDetails.jobNotFound')}</p>
          <Link
            to="/jobs"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('pages.jobDetails.backToJobs')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 lg:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('pages.jobDetails.backToJobs')}
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 lg:p-8 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                {/* Company Logo */}
                <div className="flex items-start gap-4 mb-4">
                  {getJobImageUrl(job) ? (
                    <img
                      src={getJobImageUrl(job)}
                      alt={job.company?.name || t('pages.jobs.company')}
                      className="h-16 w-16 rounded-xl object-cover flex-shrink-0 border border-slate-200 bg-slate-50"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
                      {job.title}
                    </h1>
                    <p className="text-slate-600">
                      {job.company?.name || 
                       (job.author ? `${job.author.firstName} ${job.author.lastName}` : t('pages.jobs.company'))}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getJobTypeBadgeColor(job.jobType)}`}>
                    <Briefcase className="h-4 w-4 mr-1.5" />
                    {getJobTypeLabel(job.jobType)}
                  </span>
                  {job.isRemote && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-teal-100 text-teal-700">
                      <Globe className="h-4 w-4 mr-1.5" />
                      {t('pages.jobType.remote')}
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {job.location}
                  </span>
                </div>
              </div>

              {/* Status Info */}
              <div className="flex flex-col items-end gap-2">
                {isJobOwner && (
                  <div className="flex items-center text-sm text-slate-500">
                    <Eye className="h-4 w-4 mr-1" />
                    {job.viewsCount} {t('pages.jobDetails.views')}
                  </div>
                )}
                {!isJobOwner && applied && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('pages.jobDetails.applied')}
                  </div>
                )}
                {!isJobOwner && currentUser && (
                  <button
                    onClick={handleSaveJob}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isSaved
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    } disabled:opacity-50`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-4 w-4" />
                        {t('pages.jobDetails.saved')}
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" />
                        {t('pages.jobDetails.save')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 lg:p-8 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('pages.jobDetails.salary')}</p>
                <p className="font-medium text-slate-900 text-sm">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('pages.jobDetails.jobType')}</p>
                <p className="font-medium text-slate-900 text-sm">{getJobTypeLabel(job.jobType)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('pages.jobDetails.location')}</p>
                <p className="font-medium text-slate-900 text-sm">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('pages.jobDetails.posted')}</p>
                <p className="font-medium text-slate-900 text-sm">{formatDate(job.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('pages.jobDetails.jobDescription')}</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="p-6 lg:p-8 border-t border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('pages.jobDetails.requirements')}</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply CTA - Only show if not job owner and not applied */}
          {!isJobOwner && !applied && (
            <div className="p-6 lg:p-8 bg-[#0A66C2] border-t border-slate-100 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-white">
                  <h3 className="font-semibold text-lg mb-1">{t('pages.jobDetails.interested')}</h3>
                  <p className="text-sm text-blue-100">{t('pages.jobDetails.submitGetNoticed')}</p>
                </div>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#0A66C2] rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  <Send className="h-5 w-5" />
                  {t('pages.jobDetails.applyNow')}
                </button>
              </div>
            </div>
          )}

          {/* Applied Status */}
          {!isJobOwner && applied && (
            <div className="p-6 lg:p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-slate-100 rounded-b-2xl">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <h3 className="font-semibold text-slate-900">{t('pages.jobDetails.applicationSubmitted')}</h3>
                  <p className="text-sm text-slate-600">{t('pages.jobDetails.employerWillReview')}</p>
                  {existingApplication?.status && APPLICATION_STATUS_KEYS[existingApplication.status] && (
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {t(`pages.myApplications.${APPLICATION_STATUS_KEYS[existingApplication.status]}`)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Owner CTA */}
          {isJobOwner && (
            <div className="p-6 lg:p-8 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-100 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{t('pages.jobDetails.managePosting')}</h3>
                  <p className="text-sm text-slate-600">{t('pages.jobDetails.viewApplicationsDesc')}</p>
                </div>
                <Link
                  to={`/jobs/${job.id}/applications`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  {t('pages.jobDetails.viewApplications')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal - Only show if not job owner */}
      {showApplyModal && !isJobOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowApplyModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('pages.jobDetails.applyForJob')}</h2>
                <p className="text-sm text-slate-600 mt-1">{job.title}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {applyError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {applyError}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('pages.jobDetails.coverLetterOptional')}
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  placeholder={t('pages.jobDetails.coverLetterPlaceholder')}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {t('pages.jobDetails.coverLetterHint')}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-slate-900">{t('pages.jobDetails.profileShared')}</p>
                    <p className="text-slate-600">{t('pages.jobDetails.employerWillSee')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2.5 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                {t('pages.jobDetails.cancel')}
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {applying ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t('pages.jobDetails.applying')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t('pages.jobDetails.submitApplication')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
