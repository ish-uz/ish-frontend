import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Briefcase, MapPin, DollarSign, FileText,
  Plus, X, Save, Globe, Building2
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { companyService } from '../../companies/services/companyService';
import { JobType, JobCreate, Company } from '@/types';
import { parseSalaryInput } from '@/utils';

export function CreateJobPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Form state
  const [formData, setFormData] = useState<JobCreate>({
    title: '',
    description: '',
    location: '',
    salaryMin: undefined,
    salaryMax: undefined,
    salaryCurrency: 'UZS',
    jobType: 'full-time',
    requirements: [],
    isRemote: false,
    companyId: undefined,
  });
  const [newRequirement, setNewRequirement] = useState('');
  // Salary inputs as text so user can type "2.500.000"
  const [salaryMinDisplay, setSalaryMinDisplay] = useState('');
  const [salaryMaxDisplay, setSalaryMaxDisplay] = useState('');

  // Load user's companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await companyService.getMyCompanies();
        setCompanies(data);
      } catch (err: any) {
        // Silently fail - company selection is optional
        console.error('Failed to load companies:', err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  const jobTypes: { value: JobType; labelKey: string }[] = [
    { value: 'full-time', labelKey: 'fullTime' },
    { value: 'part-time', labelKey: 'partTime' },
    { value: 'contract', labelKey: 'contract' },
    { value: 'internship', labelKey: 'internship' },
    { value: 'remote', labelKey: 'remote' },
  ];

  const currencies = ['UZS', 'USD', 'EUR', 'RUB'];

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements?.includes(newRequirement.trim())) {
      setFormData({
        ...formData,
        requirements: [...(formData.requirements || []), newRequirement.trim()],
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError(t('pages.createJob.jobTitleRequired'));
      return;
    }
    if (!formData.description.trim()) {
      setError(t('pages.createJob.descriptionRequired'));
      return;
    }
    if (!formData.location.trim()) {
      setError(t('pages.createJob.locationRequired'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const salaryMin = parseSalaryInput(salaryMinDisplay);
      const salaryMax = parseSalaryInput(salaryMaxDisplay);
      const payload: JobCreate = {
        ...formData,
        salaryMin: salaryMin ?? undefined,
        salaryMax: salaryMax ?? undefined,
      };
      const job = await jobService.createJob(payload);
      navigate(`/jobs/${job.id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || t('pages.createJob.createFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 lg:py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('pages.createJob.backToJobs')}
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Briefcase className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('pages.createJob.title')}</h1>
          </div>
          <p className="text-slate-600 text-sm lg:text-base">
            {t('pages.createJob.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              {t('pages.createJob.basicInfo')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('pages.createJob.jobTitle')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('pages.createJob.jobTitlePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('pages.createJob.companyOptional')}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={formData.companyId || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      companyId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    disabled={loadingCompanies}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{t('pages.createJob.individualCompany')}</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                {companies.length === 0 && !loadingCompanies && (
                  <p className="mt-1 text-xs text-slate-500">
                    {t('pages.createJob.noCompaniesYet')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('pages.createJob.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={t('pages.createJob.descriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('pages.createJob.jobType')}
                  </label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {t(`pages.jobType.${type.labelKey}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('pages.createJob.location')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('pages.createJob.locationPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRemote}
                    onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Globe className="h-4 w-4 text-teal-600" />
                    {t('pages.createJob.remotePosition')}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Salary Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              {t('pages.createJob.salaryOptional')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('pages.createJob.minimum')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryMinDisplay}
                  onChange={(e) => setSalaryMinDisplay(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('pages.createJob.salaryMinPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('pages.createJob.maximum')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryMaxDisplay}
                  onChange={(e) => setSalaryMaxDisplay(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('pages.createJob.salaryMaxPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('pages.createJob.currency')}
                </label>
                <select
                  value={formData.salaryCurrency}
                  onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Requirements Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              {t('pages.createJob.requirementsOptional')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('pages.createJob.addRequirement')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('pages.createJob.requirementPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {formData.requirements && formData.requirements.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {t('pages.createJob.requirementsCount', { count: formData.requirements.length })}
                  </p>
                  <ul className="space-y-2">
                    {formData.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <span className="text-sm text-slate-700">{req}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('pages.createJob.creating')}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {t('pages.createJob.postJob')}
                </>
              )}
            </button>
            <Link
              to="/jobs"
              className="flex-1 sm:flex-none flex items-center justify-center px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              {t('pages.createJob.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
