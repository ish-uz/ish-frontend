import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Plus, MapPin, Eye, Users, Calendar,
  Edit2, Trash2, MoreVertical, CheckCircle2, Clock, XCircle, Send
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { applicationService } from '@/features/applications/services/applicationService';
import { Pagination } from '@/components/ui/Pagination';
import { Job } from '@/types';

export function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadJobs();
  }, [currentPage]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      const result = await jobService.getMyJobs(skip, itemsPerPage);
      setJobs(result.jobs);
      setTotalItems(result.total);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || 'Failed to load jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await jobService.deleteJob(id);
      setJobs(jobs.filter(job => job.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete job');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const updated = await jobService.updateJob(id, { status: 'active' });
      setJobs(jobs.map(job => job.id === id ? updated : job));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to publish job');
    }
  };

  const handleClose = async (id: number) => {
    try {
      const updated = await jobService.updateJob(id, { status: 'closed' });
      setJobs(jobs.map(job => job.id === id ? updated : job));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to close job');
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
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: 'Active',
      },
      draft: {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        icon: <Clock className="h-4 w-4" />,
        label: 'Draft',
      },
      closed: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Closed',
      },
    };
    return badges[status] || badges.draft;
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote',
    };
    return labels[type] || type;
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Briefcase className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600" />
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Jobs</h1>
            </div>
            <p className="text-slate-600 text-sm lg:text-base">
              Manage your job postings
            </p>
          </div>
          <Link
            to="/jobs/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Post New Job
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-12 text-center">
            <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first job posting to start finding candidates
            </p>
            <Link
              to="/jobs/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const statusBadge = getStatusBadge(job.status);
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {getJobTypeLabel(job.jobType)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(job.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {activeMenu === job.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenu(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                <Link
                                  to={`/jobs/${job.id}`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <Eye className="h-4 w-4" />
                                  View Job
                                </Link>
                                <Link
                                  to={`/jobs/${job.id}/edit`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Edit Job
                                </Link>
                                {job.status === 'draft' && (
                                  <button
                                    onClick={() => {
                                      setActiveMenu(null);
                                      handlePublish(job.id);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full"
                                  >
                                    <Send className="h-4 w-4" />
                                    Publish Job
                                  </button>
                                )}
                                {job.status === 'active' && (
                                  <button
                                    onClick={() => {
                                      setActiveMenu(null);
                                      handleClose(job.id);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Close Job
                                  </button>
                                )}
                                <div className="border-t border-slate-100 my-1"></div>
                                <button
                                  onClick={() => {
                                    setActiveMenu(null);
                                    handleDelete(job.id);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Job
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.icon}
                          {statusBadge.label}
                        </span>
                        {job.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(job.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Publish
                          </button>
                        )}
                        {job.status === 'active' && (
                          <button
                            onClick={() => handleClose(job.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Close
                          </button>
                        )}
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Eye className="h-4 w-4" />
                          {job.viewsCount} views
                        </span>
                        {job.status === 'active' && (
                          <Link
                            to={`/jobs/${job.id}/applications`}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Users className="h-4 w-4" />
                            Applications
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {jobs.length > 0 && (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
              <p className="text-sm text-slate-500">Total Jobs</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {jobs.filter(j => j.status === 'active').length}
              </p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-600">
                {jobs.filter(j => j.status === 'draft').length}
              </p>
              <p className="text-sm text-slate-500">Drafts</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {jobs.reduce((acc, job) => acc + job.viewsCount, 0)}
              </p>
              <p className="text-sm text-slate-500">Total Views</p>
            </div>
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
