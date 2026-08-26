import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { serviceService } from '../services/serviceService';
import { ServiceCategory, ServiceListing } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { formatSalaryInputAsTyped, getServiceImageUrl, parseSalaryInput } from '@/utils';
import { SERVICE_CATEGORIES } from '../constants';
import {
  Wrench, MapPin, DollarSign, Search, Filter, X, Plus,
} from 'lucide-react';

function ServicesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
          <div className="h-40 bg-slate-200" />
          <div className="p-4 space-y-3">
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-1/2 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [location, setLocation] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [appliedPriceMin, setAppliedPriceMin] = useState('');
  const [appliedPriceMax, setAppliedPriceMax] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, category, appliedLocation, appliedPriceMin, appliedPriceMax]);

  useEffect(() => {
    loadServices();
  }, [currentPage, debouncedSearchQuery, category, appliedLocation, appliedPriceMin, appliedPriceMax]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (currentPage - 1) * itemsPerPage;
      const result = await serviceService.getServices(skip, itemsPerPage, {
        status: 'active',
        search: debouncedSearchQuery || undefined,
        category: category || undefined,
        location: appliedLocation || undefined,
        priceMin: parseSalaryInput(appliedPriceMin),
        priceMax: parseSalaryInput(appliedPriceMax),
      });
      setServices(result.services);
      setTotalItems(result.total);
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail;
      setError(
        typeof errorDetail === 'string' ? errorDetail : t('pages.services.failedToLoad'),
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setAppliedLocation(location);
    setAppliedPriceMin(priceMin);
    setAppliedPriceMax(priceMax);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setCategory('');
    setLocation('');
    setAppliedLocation('');
    setPriceMin('');
    setPriceMax('');
    setAppliedPriceMin('');
    setAppliedPriceMax('');
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      category !== '' ||
      appliedLocation.trim() !== '' ||
      appliedPriceMin !== '' ||
      appliedPriceMax !== '',
  );

  const formatPrice = (item: ServiceListing) => {
    const currency = item.priceCurrency || 'UZS';
    if (item.priceType === 'negotiable' && !item.priceMin && !item.priceMax) {
      return t('pages.servicePriceType.negotiable');
    }
    if (item.priceMin && item.priceMax) {
      return `${item.priceMin.toLocaleString()} – ${item.priceMax.toLocaleString()} ${currency}`;
    }
    if (item.priceMin) return `${item.priceMin.toLocaleString()}+ ${currency}`;
    if (item.priceMax) return `≤ ${item.priceMax.toLocaleString()} ${currency}`;
    return t('pages.servicePriceType.negotiable');
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-shadow';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        <div className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {t('pages.services.title')}
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                {t('pages.services.subtitle')}
              </p>
            </div>
          </div>
          <Link
            to="/services/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-all hover:shadow-md hover:shadow-blue-600/20 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            {t('pages.services.postService')}
          </Link>
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
              placeholder={t('pages.services.searchPlaceholder')}
              className={`${inputClass} pl-11 pr-4 py-3`}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === ''
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('pages.services.allCategories')}
            </button>
            {SERVICE_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(category === c.value ? '' : c.value)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === c.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t(`pages.serviceCategory.${c.labelKey}`)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('pages.services.locationPlaceholder')}
              className={inputClass}
            />
            <input
              type="text"
              inputMode="numeric"
              value={priceMin}
              onChange={(e) => setPriceMin(formatSalaryInputAsTyped(e.target.value))}
              placeholder={t('pages.services.minPrice')}
              className={inputClass}
            />
            <input
              type="text"
              inputMode="numeric"
              value={priceMax}
              onChange={(e) => setPriceMax(formatSalaryInputAsTyped(e.target.value))}
              placeholder={t('pages.services.maxPrice')}
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                {t('pages.services.clearAll')}
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={applyFilters}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-all hover:shadow-md hover:shadow-blue-600/20"
            >
              <Filter className="h-4 w-4" />
              {t('pages.services.applyFilters')}
            </button>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
              {t('pages.services.found', { count: totalItems })}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadServices}
              className="text-sm font-medium text-red-700 hover:text-red-900 underline"
            >
              {t('pages.services.retry')}
            </button>
          </div>
        )}

        <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          {loading && services.length === 0 ? (
            <ServicesSkeleton />
          ) : services.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-16 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                <Wrench className="h-7 w-7 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('pages.services.noResults')}
              </h3>
              <p className="text-slate-500 mb-5 max-w-md mx-auto">
                {t('pages.services.tryAdjusting')}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t('pages.services.clearAll')}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((item, index) => {
                  const imageUrl = getServiceImageUrl(item);
                  return (
                    <Link
                      key={item.id}
                      to={`/services/${item.id}`}
                      className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-orange-200 animate-fade-up"
                      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-40 w-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <Wrench className="h-12 w-12 text-white/90" />
                        </div>
                      )}
                      <div className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 mb-2 border border-orange-100">
                          {t(`pages.serviceCategory.${item.category}`)}
                        </span>
                        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex items-center text-sm text-slate-500 mb-1.5">
                          <MapPin className="h-4 w-4 mr-1.5 text-slate-400" />
                          {item.location}
                        </div>
                        <div className="flex items-center text-sm text-slate-800 font-semibold">
                          <DollarSign className="h-4 w-4 mr-1 text-slate-400" />
                          {formatPrice(item)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {totalItems > itemsPerPage && (
                <div className="mt-6">
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
