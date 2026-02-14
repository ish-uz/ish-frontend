import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-700 font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>{t('landing.hero.badge')}</span>
            </div>
          </div>

          {/* Main heading with better typography */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight text-center">
            <span className="block">{t('landing.hero.title1')}</span>
            <span className="block bg-gradient-to-r from-[#0A66C2] to-blue-600 bg-clip-text text-transparent">
              {t('landing.hero.title2')}
            </span>
            <span className="block">{t('landing.hero.title3')}</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}{' '}
            <span className="text-gray-500">{t('landing.hero.subtitle2')}</span>
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 mb-6 max-w-3xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg focus-within:border-[#0A66C2] focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <label htmlFor="job-search" className="sr-only">
                  {t('landing.hero.searchLabel')}
                </label>
                <input
                  id="job-search"
                  type="text"
                  placeholder={t('landing.hero.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                  aria-label={t('landing.hero.searchLabel')}
                />
              </div>
              <div className="flex gap-2">
                <Link
                  to="/jobs"
                  className="group px-6 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182] transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2 text-sm"
                >
                  <span>{t('landing.hero.findJob')}</span>
                  <Search className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/employers"
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center text-sm"
                >
                  {t('landing.hero.findEmployee')}
                </Link>
              </div>
            </div>
            
            {/* Quick filters */}
            <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
              <span className="text-xs text-gray-500">{t('landing.hero.quickSearch')}</span>
              {['Dasturchi', 'Sotuvchi', 'Muhandis', 'Toshkent'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 text-xs bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-[#0A66C2] rounded-md border border-gray-200 hover:border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  aria-label={t('landing.hero.changeSearchTo', { tag })}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold text-xs">✓</span>
              </div>
              <span>{t('landing.hero.verifiedCompanies')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="h-3 w-3 text-blue-600" />
              </div>
              <span>{t('landing.hero.allCities')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <Building2 className="h-3 w-3 text-purple-600" />
              </div>
              <span>{t('landing.hero.companiesCount')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
