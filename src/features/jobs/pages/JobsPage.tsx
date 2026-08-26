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

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.jobs.loading')}</p>
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
            onClick={loadJobs}
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
            <Briefcase className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('pages.jobs.title')}</h1>
          </div>
          <p className="text-gray-600">
            {t('pages.jobs.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 mb-6">
          {/* Main Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pages.jobs.searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Skills Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 flex-shrink-0">
              <Code className="h-4 w-4 text-blue-600" />
              <span>{t('pages.jobs.skills')}</span>
            </div>
            
            <div className="flex-1 flex flex-wrap gap-2 min-w-0">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                >
                  {skill}
                  <button
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
                  onKeyPress={handleKeyPress}
                  placeholder={t('pages.jobs.addSkill')}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleAddSkill}
                  disabled={!skillInput.trim()}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {t('pages.jobs.add')}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>{t('pages.jobs.advancedFilters')}</span>
              {getActiveFiltersCount() > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>
            {showAdvancedFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    {t('pages.jobs.jobType')}
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as JobType | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">{t('pages.jobs.allTypes')}</option>
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {t(`pages.jobType.${type.labelKey}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    {t('pages.jobs.location')}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t('pages.jobs.locationPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Remote Work */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Globe className="h-4 w-4 inline mr-1" />
                    {t('pages.jobs.remoteWork')}
                  </label>
                  <select
                    value={isRemote === null ? '' : isRemote ? 'true' : 'false'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setIsRemote(value === '' ? null : value === 'true');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">{t('pages.jobs.all')}</option>
                    <option value="true">{t('pages.jobs.remoteOnly')}</option>
                    <option value="false">{t('pages.jobs.onSiteOnly')}</option>
                  </select>
                </div>

                {/* Salary Min */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    {t('pages.jobs.minSalary')}
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                    placeholder={t('pages.jobs.salaryPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Salary Max */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    {t('pages.jobs.maxSalary')}
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                    placeholder={t('pages.jobs.salaryPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {t('pages.jobs.postedAfter')}
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {hasUnsavedFilters && (
                    <span className="text-orange-600 font-medium">{t('pages.jobs.unsavedFilters')}</span>
                  )}
                </div>
                <button
                  onClick={applyFilters}
                  disabled={!hasUnsavedFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {t('pages.jobs.applyFilters')}
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>
                  {jobs.length === 1 ? t('pages.jobs.jobsFoundOne', { count: jobs.length }) : t('pages.jobs.jobsFoundMany', { count: jobs.length })}
                  {getActiveFiltersCount() > 0 && ` (${getActiveFiltersCount() === 1 ? t('pages.jobs.filtersActiveOne', { count: getActiveFiltersCount() }) : t('pages.jobs.filtersActiveMany', { count: getActiveFiltersCount() })})`}
                </span>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                {t('pages.jobs.clearAll')}
              </button>
            </div>
          )}

          {!hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>{jobs.length === 1 ? t('pages.jobs.jobsAvailableOne', { count: jobs.length }) : t('pages.jobs.jobsAvailableMany', { count: jobs.length })}</span>
            </div>
          )}
        </div>

        {/* Loading indicator for search */}
        {loading && jobs.length > 0 && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>{t('pages.jobs.searching')}</span>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Briefcase className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? t('pages.jobs.noResults') : t('pages.jobs.noJobsFound')}
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters
                ? t('pages.jobs.tryAdjusting')
                : t('pages.jobs.noVacancies')}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('pages.jobs.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
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
                          ? `From ${job.salaryMin.toLocaleString()}`
                          : `Up to ${job.salaryMax?.toLocaleString()}`
                        }{' '}
                        {job.salaryCurrency}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600" title={new Date(job.createdAt).toLocaleString(i18n.language)}>
                    <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span>{formatRelativeTime(job.createdAt)}</span>
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
