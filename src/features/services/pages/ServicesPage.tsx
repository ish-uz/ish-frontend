import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { serviceService } from '../services/serviceService';
import { ServiceCategory, ServiceListing } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { formatSalaryInputAsTyped, getServiceImageUrl, parseSalaryInput } from '@/utils';
import { SERVICE_CATEGORIES } from '../constants';
import {
  Wrench, MapPin, DollarSign, Search, Filter, X, Plus
} from 'lucide-react';

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
        typeof errorDetail === 'string' ? errorDetail : t('pages.services.failedToLoad')
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

  const hasActiveFilters =
    searchQuery.trim() ||
    category !== '' ||
    appliedLocation.trim() !== '' ||
    appliedPriceMin !== '' ||
    appliedPriceMax !== '';

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

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('pages.services.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadServices} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {t('pages.services.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Wrench className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600" />
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('pages.services.title')}</h1>
            </div>
            <p className="text-slate-600 text-sm lg:text-base">{t('pages.services.subtitle')}</p>
          </div>
          <Link
            to="/services/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            {t('pages.services.postService')}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pages.services.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                category === '' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('pages.services.allCategories')}
            </button>
            {SERVICE_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(category === c.value ? '' : c.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  category === c.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              inputMode="numeric"
              value={priceMin}
              onChange={(e) => setPriceMin(formatSalaryInputAsTyped(e.target.value))}
              placeholder={t('pages.services.minPrice')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="text"
              inputMode="numeric"
              value={priceMax}
              onChange={(e) => setPriceMax(formatSalaryInputAsTyped(e.target.value))}
              placeholder={t('pages.services.maxPrice')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {t('pages.services.applyFilters')}
            </button>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {t('pages.services.found', { count: totalItems })}
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                {t('pages.services.clearAll')}
              </button>
            </div>
          )}
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Wrench className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('pages.services.noResults')}</h3>
            <p className="text-gray-500 mb-4">{t('pages.services.tryAdjusting')}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('pages.services.clearAll')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((item) => (
                <Link
                  key={item.id}
                  to={`/services/${item.id}`}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {getServiceImageUrl(item) ? (
                    <img
                      src={getServiceImageUrl(item)}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Wrench className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-2">
                      {t(`pages.serviceCategory.${item.category}`)}
                    </span>
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center text-sm text-slate-500 mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.location}
                    </div>
                    <div className="flex items-center text-sm text-slate-700 font-medium">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatPrice(item)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
          </>
        )}
      </div>
    </div>
  );
}
