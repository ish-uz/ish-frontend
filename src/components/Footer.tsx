import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const footerLinks = {
    about: [
      { label: t('landing.footer.about'), to: '/about' },
      { label: t('landing.footer.howItWorks'), to: '/how-it-works' },
      { label: t('landing.footer.contact'), to: '/contact' },
    ],
    employers: [
      { label: t('landing.footer.employers'), to: '/employers' },
      { label: t('landing.footer.postJob'), to: '/employers/post' },
      { label: t('landing.footer.pricing'), to: '/employers/pricing' },
    ],
    freelancers: [
      { label: t('landing.footer.freelancers'), to: '/freelancers' },
      { label: t('landing.footer.services'), to: '/freelancers/services' },
      { label: t('landing.footer.support'), to: '/freelancers/support' },
    ],
    legal: [
      { label: t('landing.footer.privacy'), to: '/privacy' },
      { label: t('landing.footer.terms'), to: '/terms' },
      { label: t('landing.footer.cookies'), to: '/cookies' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2] text-white font-bold text-xl">
                ISH
              </div>
              <span className="text-xl font-bold text-white">ISH</span>
            </div>
            <p className="text-sm text-gray-400">
              {t('landing.footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('landing.footer.info')}</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
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
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} ISH. {t('landing.footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
