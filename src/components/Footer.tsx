import { Link } from 'react-router-dom';

export function Footer() {
  const footerLinks = {
    about: [
      { label: 'Biz haqimizda', to: '/about' },
      { label: 'Qanday ishlaydi', to: '/how-it-works' },
      { label: 'Bog\'lanish', to: '/contact' },
    ],
    employers: [
      { label: 'Ish beruvchilar', to: '/employers' },
      { label: 'E\'lon joylash', to: '/employers/post' },
      { label: 'Narxlar', to: '/employers/pricing' },
    ],
    freelancers: [
      { label: 'Freelancerlar', to: '/freelancers' },
      { label: 'Xizmatlar', to: '/freelancers/services' },
      { label: 'Qo\'llab-quvvatlash', to: '/freelancers/support' },
    ],
    legal: [
      { label: 'Maxfiylik siyosati', to: '/privacy' },
      { label: 'Foydalanish shartlari', to: '/terms' },
      { label: 'Cookie siyosati', to: '/cookies' },
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
              Ish va mutaxassislar topishning eng oson yo'li
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ma'lumot</h3>
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
            <h3 className="text-white font-semibold mb-4">Ish beruvchilar</h3>
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
            <h3 className="text-white font-semibold mb-4">Freelancerlar</h3>
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
            <h3 className="text-white font-semibold mb-4">Huquqiy</h3>
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
          <p>&copy; {new Date().getFullYear()} ISH. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}
