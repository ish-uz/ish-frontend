import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Briefcase,
  Wrench,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export function MainBlocks() {
  const { t } = useTranslation();
  const blocks = [
    {
      icon: User,
      titleKey: 'lookingForJob' as const,
      descKey: 'lookingDesc' as const,
      link: '/jobs',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      buttonColor: 'bg-[#0A66C2] hover:bg-[#004182]',
      featureKeys: ['jobSeekers', 'vacancies', 'freeApply'] as const,
      badgeKey: 'mostPopular' as const,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      icon: Briefcase,
      titleKey: 'needEmployee' as const,
      descKey: 'needEmployeeDesc' as const,
      link: '/employers',
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      featureKeys: ['companies', 'quickFind', 'freePost'] as const,
      badgeKey: 'new' as const,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      icon: Wrench,
      titleKey: 'freelancer' as const,
      descKey: 'freelancerDesc' as const,
      link: '/freelancers',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      featureKeys: ['projects', 'clients', 'flexSchedule'] as const,
      badgeKey: 'fast' as const,
      badgeColor: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <section className='py-12 bg-gradient-to-b from-white to-gray-50'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-10'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
            {t('landing.mainBlocks.title')}
          </h2>
          <p className='text-base text-gray-600 max-w-2xl mx-auto'>
            {t('landing.mainBlocks.subtitle')}
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-4 lg:gap-6'>
          {blocks.map((block, index) => {
            const Icon = block.icon;
            return (
              <div
                key={index}
                className={`relative group ${block.bgColor} rounded-xl border-2 ${block.borderColor} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                {/* Badge */}
                {block.badgeKey && (
                  <div
                    className={`absolute -top-2 right-4 px-2 py-0.5 ${block.badgeColor} rounded-full text-xs font-semibold`}
                  >
                    {t(`landing.mainBlocks.${block.badgeKey}`)}
                  </div>
                )}

                {/* Icon with gradient background */}
                <div className='mb-4'>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${block.gradient} text-white shadow-md mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className='h-8 w-8' />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${block.textColor}`}>
                    {t(`landing.mainBlocks.${block.titleKey}`)}
                  </h3>
                  <p className='text-sm text-gray-600 mb-4'>
                    {t(`landing.mainBlocks.${block.descKey}`)}
                  </p>
                </div>

                {/* Features list */}
                <ul className='space-y-2 mb-4'>
                  {block.featureKeys.map((key, idx) => (
                    <li
                      key={idx}
                      className='flex items-center gap-2 text-xs text-gray-700'
                    >
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${block.textColor} flex-shrink-0`}
                      />
                      <span>{t(`landing.mainBlocks.${key}`)}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Link
                  to={block.link}
                  className={`inline-flex items-center justify-between w-full ${block.buttonColor} text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg group/btn text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`}
                >
                  <span>{t('landing.mainBlocks.learnMore')}</span>
                  <ArrowRight className='h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform' />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
