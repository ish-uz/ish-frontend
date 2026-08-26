import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jobService } from '../services/jobService';
import { Job, JobType } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { formatRelativeTime, getJobImageUrl } from '@/utils';
import {
  Briefcase, MapPin, DollarSign, Clock, Search, Filter, Building2, X, Code,
  ChevronDown, ChevronUp, Globe, Calendar, SlidersHorizontal
} from 'lucide-react';

const jobTypeLabelKey: Record<JobType, string> = {
  'full-time': 'fullTime',
  'part-time': 'partTime',
  'contract': 'contract',
  'internship': 'internship',
  'remote': 'remote',
};

function JobsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
          <div className="flex gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 w-2/3 bg-slate-100 rounded" />
            <div className="h-3 w-1/2 bg-slate-100 rounded" />
          </div>
          <div className="h-10 w-full bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function JobsPage() {
  const { t, i18n } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Advanced filters (local state - not applied until "Apply Filters" is clicked)
  const [jobType, setJobType] = useState<JobType | ''>('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [isRemote, setIsRemote] = useState<boolean | null>(null);
  const [dateFrom, setDateFrom] = useState('');

  // Applied filters (used for API calls)
  const [appliedJobType, setAppliedJobType] = useState<JobType | ''>('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [appliedSalaryMin, setAppliedSalaryMin] = useState<number | ''>('');
  const [appliedSalaryMax, setAppliedSalaryMax] = useState<number | ''>('');
  const [appliedIsRemote, setAppliedIsRemote] = useState<boolean | null>(null);
  const [appliedDateFrom, setAppliedDateFrom] = useState('');

  const jobTypes: { value: JobType; labelKey: string }[] = [
    { value: 'full-time', labelKey: 'fullTime' },
    { value: 'part-time', labelKey: 'partTime' },
    { value: 'contract', labelKey: 'contract' },
    { value: 'internship', labelKey: 'internship' },
    { value: 'remote', labelKey: 'remote' },
  ];

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedSkills, appliedJobType, appliedLocation, appliedSalaryMin, appliedSalaryMax, appliedIsRemote, appliedDateFrom]);

  // Load jobs when filters or page change
  useEffect(() => {
    loadJobs();
  }, [currentPage, debouncedSearchQuery, selectedSkills, appliedJobType, appliedLocation, appliedSalaryMin, appliedSalaryMax, appliedIsRemote, appliedDateFrom]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (currentPage - 1) * itemsPerPage;
      const result = await jobService.getJobs(
        skip,
        itemsPerPage,
        'active',
        selectedSkills.length > 0 ? selectedSkills : undefined,
        debouncedSearchQuery || undefined,
        appliedJobType || undefined,
        appliedLocation || undefined,
        appliedSalaryMin !== '' ? Number(appliedSalaryMin) : undefined,
        appliedSalaryMax !== '' ? Number(appliedSalaryMax) : undefined,
        appliedIsRemote !== null ? appliedIsRemote : undefined,
        appliedDateFrom || undefined
      );
      setJobs(result.jobs);
      setTotalItems(result.total);
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? errorDetail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
        : typeof errorDetail === 'string'
        ? errorDetail
        : t('pages.jobs.failedToLoad');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const applyFilters = () => {
    setAppliedJobType(jobType);
    setAppliedLocation(location);
    setAppliedSalaryMin(salaryMin);
    setAppliedSalaryMax(salaryMax);
    setAppliedIsRemote(isRemote);
    setAppliedDateFrom(dateFrom);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedSkills([]);
    setJobType('');
    setLocation('');
    setSalaryMin('');
    setSalaryMax('');
    setIsRemote(null);
    setDateFrom('');
    // Also clear applied filters
    setAppliedJobType('');
    setAppliedLocation('');
    setAppliedSalaryMin('');
    setAppliedSalaryMax('');
    setAppliedIsRemote(null);
    setAppliedDateFrom('');
  };

  const hasActiveFilters = 
    searchQuery.trim() || 
    selectedSkills.length > 0 ||
    appliedJobType !== '' ||
    appliedLocation.trim() !== '' ||
    appliedSalaryMin !== '' ||
    appliedSalaryMax !== '' ||
    appliedIsRemote !== null ||
    appliedDateFrom !== '';

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedSkills.length > 0) count++;
    if (appliedJobType !== '') count++;
    if (appliedLocation.trim()) count++;
    if (appliedSalaryMin !== '' || appliedSalaryMax !== '') count++;
    if (appliedIsRemote !== null) count++;
    if (appliedDateFrom) count++;
    return count;
  };

  const hasUnsavedFilters = 
    jobType !== appliedJobType ||
    location !== appliedLocation ||
    salaryMin !== appliedSalaryMin ||
    salaryMax !== appliedSalaryMax ||
    isRemote !== appliedIsRemote ||
    dateFrom !== appliedDateFrom;


  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-shadow';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        <div className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {t('pages.jobs.title')}
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                {t('pages.jobs.subtitle')}
              </p>
            </div>
          </div>
          {!loading && (
            <p className="text-sm text-slate-500 sm:text-right">
              {totalItems === 1
                ? t('pages.jobs.jobsAvailableOne', { count: totalItems })
                : t('pages.jobs.jobsAvailableMany', { count: totalItems })}
            </p>
          )}
        </div>

        <div
          className="animate-fade-up bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5"
          style={{ animationDelay: '60ms' }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pages.jobs.searchPlaceholder')}
              className={`${inputClass} pl-11 pr-10 py-3`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 flex-shrink-0">
              <Code className="h-4 w-4 text-blue-600" />
              <span>{t('pages.jobs.skills')}</span>
            </div>
            <div className="flex-1 flex flex-wrap gap-2 min-w-0">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                    aria-label={t('pages.jobs.removeSkill', { skill })}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <div className="flex gap-2 flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t('pages.jobs.addSkill')}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!skillInput.trim()}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {t('pages.jobs.add')}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              {t('pages.jobs.advancedFilters')}
              {getActiveFiltersCount() > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </span>
            {showAdvancedFilters ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <Briefcase className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                    {t('pages.jobs.jobType')}
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as JobType | '')}
                    className={inputClass}
                  >
                    <option value="">{t('pages.jobs.allTypes')}</option>
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {t(`pages.jobType.${type.labelKey}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <MapPin className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                    {t('pages.jobs.location')}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t('pages.jobs.locationPlaceholder')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <Globe className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                    {t('pages.jobs.remoteWork')}
                  </label>
                  <select
                    value={isRemote === null ? '' : isRemote ? 'true' : 'false'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setIsRemote(value === '' ? null : value === 'true');
                    }}
                    className={inputClass}
                  >
                    <option value="">{t('pages.jobs.all')}</option>
                    <option value="true">{t('pages.jobs.remoteOnly')}</option>
                    <option value="false">{t('pages.jobs.onSiteOnly')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <DollarSign className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                    {t('pages.jobs.minSalary')}
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                    placeholder={t('pages.jobs.salaryPlaceholder')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <DollarSign className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                    {t('pages.jobs.maxSalary')}
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                    placeholder={t('pages.jobs.salaryPlaceholder')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    <Calendar className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                    {t('pages.jobs.postedAfter')}
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  {hasUnsavedFilters && (
                    <span className="text-amber-600 font-medium">
                      {t('pages.jobs.unsavedFilters')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={applyFilters}
                  disabled={!hasUnsavedFilters}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 text-sm hover:shadow-md hover:shadow-blue-600/20"
                >
                  <Filter className="h-4 w-4" />
                  {t('pages.jobs.applyFilters')}
                </button>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500 min-w-0">
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {totalItems === 1
                    ? t('pages.jobs.jobsFoundOne', { count: totalItems })
                    : t('pages.jobs.jobsFoundMany', { count: totalItems })}
                  {getActiveFiltersCount() > 0 &&
                    ` (${
                      getActiveFiltersCount() === 1
                        ? t('pages.jobs.filtersActiveOne', { count: getActiveFiltersCount() })
                        : t('pages.jobs.filtersActiveMany', { count: getActiveFiltersCount() })
                    })`}
                </span>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 flex-shrink-0"
              >
                <X className="h-4 w-4" />
                {t('pages.jobs.clearAll')}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadJobs}
              className="text-sm font-medium text-red-700 hover:text-red-900 underline"
            >
              {t('pages.jobs.retry')}
            </button>
          </div>
        )}

        {loading && jobs.length > 0 && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent" />
              {t('pages.jobs.searching')}
            </div>
          </div>
        )}

        <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          {loading && jobs.length === 0 ? (
            <JobsSkeleton />
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-16 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Briefcase className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {hasActiveFilters ? t('pages.jobs.noResults') : t('pages.jobs.noJobsFound')}
              </h3>
              <p className="text-slate-500 mb-5 max-w-md mx-auto">
                {hasActiveFilters ? t('pages.jobs.tryAdjusting') : t('pages.jobs.noVacancies')}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t('pages.jobs.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, index) => {
                const imageUrl = getJobImageUrl(job);
                return (
                  <article
                    key={job.id}
                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:border-blue-200 animate-fade-up"
                    style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={job.company?.name || t('pages.jobs.company')}
                          className="h-12 w-12 rounded-xl object-cover flex-shrink-0 border border-slate-200 bg-slate-50"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                          <Briefcase className="h-5 w-5 text-blue-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                          <Building2 className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {job.company?.name ||
                              (job.author
                                ? `${job.author.firstName} ${job.author.lastName}`
                                : t('pages.jobs.company'))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3 flex-1">
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                        {job.isRemote && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                            {t('pages.jobType.remote')}
                          </span>
                        )}
                      </div>
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center text-sm text-slate-600">
                          <DollarSign className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                          <span>
                            {job.salaryMin && job.salaryMax
                              ? `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`
                              : job.salaryMin
                                ? `${job.salaryMin.toLocaleString()}+`
                                : `≤ ${job.salaryMax?.toLocaleString()}`}{' '}
                            {job.salaryCurrency}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-slate-400" />
                          <span>{t(`pages.jobType.${jobTypeLabelKey[job.jobType]}`)}</span>
                        </span>
                        <span
                          className="inline-flex items-center"
                          title={new Date(job.createdAt).toLocaleString(i18n.language)}
                        >
                          <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
                          {formatRelativeTime(job.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                      {job.description}
                    </p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-500 mb-1.5">
                          {t('pages.jobs.keyRequirements')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.requirements.slice(0, 3).map((req, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                            >
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-500">
                              {t('pages.jobs.more', { count: job.requirements.length - 3 })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <Link
                      to={`/jobs/${job.id}`}
                      className="mt-auto w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium text-center text-sm hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.98]"
                    >
                      {t('pages.jobs.viewDetails')}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {!loading && jobs.length > 0 && totalItems > itemsPerPage && (
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
