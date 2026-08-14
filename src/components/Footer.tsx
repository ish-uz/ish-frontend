import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ishLogo from '@/assets/images/ish-logo.PNG';

export function Footer() {
  const { t } = useTranslation();
  const footerLinks = {
    about: [
      { label: t('landing.footer.about'), to: '/' },
      { label: t('landing.footer.howItWorks'), to: '/' },
      { label: t('landing.footer.contact'), to: '/' },
    ],
    employers: [
      { label: t('landing.footer.employers'), to: '/employees' },
      { label: t('landing.footer.postJob'), to: '/jobs/create' },
      { label: t('landing.footer.pricing'), to: '/' },
    ],
    freelancers: [
      { label: t('landing.footer.freelancers'), to: '/services' },
      { label: t('landing.footer.services'), to: '/services' },
      { label: t('landing.footer.support'), to: '/' },
    ],
    legal: [
      { label: t('landing.footer.privacy'), to: '/' },
      { label: t('landing.footer.terms'), to: '/' },
      { label: t('landing.footer.cookies'), to: '/' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src={ishLogo} alt="ISH" className="h-10 w-auto object-contain rounded-lg" />
              <span className="text-xl font-bold text-white">ISH</span>
            </Link>
            <p className="text-sm text-gray-400">
              {t('landing.footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.info')}</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.employers')}</h3>
            <ul className="space-y-2">
              {footerLinks.employers.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.freelancers')}</h3>
            <ul className="space-y-2">
              {footerLinks.freelancers.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.legal')}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} ISH. {t('landing.footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
