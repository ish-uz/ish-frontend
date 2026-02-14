import { useTranslation } from 'react-i18next';
import { Users, Building2, Briefcase, TrendingUp, Clock, Award } from 'lucide-react';

export function StatsSection() {
  const { t } = useTranslation();
  const stats = [
    {
      icon: Users,
      number: '120,000+',
      labelKey: 'jobSeekers' as const,
      sublabelKey: 'jobSeekersSub' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%',
    },
    {
      icon: Building2,
      number: '8,000+',
      labelKey: 'companies' as const,
      sublabelKey: 'companiesSub' as const,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: '+8%',
    },
    {
      icon: Briefcase,
      number: '35,000+',
      labelKey: 'jobs' as const,
      sublabelKey: 'jobsSub' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+15%',
    },
  ];

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t('landing.stats.title')}
          </h2>
          <p className="text-base text-gray-600">
            {t('landing.stats.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                {/* Trend badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                  <TrendingUp className="h-2.5 w-2.5" />
                  {stat.trend}
                </div>

                <div className="mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} mb-3`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                
                <div className={`text-3xl font-extrabold mb-1 ${stat.color}`}>
                  {stat.number}
                </div>
                <div className="text-base font-semibold text-gray-900 mb-1">
                  {t(`landing.stats.${stat.labelKey}`)}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {t(`landing.stats.${stat.sublabelKey}`)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional trust indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">4.8/5</div>
              <div className="text-xs text-gray-600">{t('landing.stats.rating')}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">98%</div>
              <div className="text-xs text-gray-600">{t('landing.stats.satisfied')}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">24/7</div>
              <div className="text-xs text-gray-600">{t('landing.stats.support')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
