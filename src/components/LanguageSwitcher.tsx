import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { supportedLanguages, type SupportedLocale } from '@/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'header' | 'sidebar';
}

export function LanguageSwitcher({ className, variant = 'header' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = i18n.language?.split('-')[0] || 'uz';
  const current = supportedLanguages.find((l) => l.code === currentLang) ?? supportedLanguages[0];

  const handleSelect = (code: SupportedLocale) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const isCompact = variant === 'sidebar';

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          isCompact
            ? 'p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            : 'px-3 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50'
        )}
        aria-label="Switch language"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4 flex-shrink-0" />
        {!isCompact && <span className="text-sm font-medium">{current.short}</span>}
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-lg border bg-white shadow-lg',
            isCompact ? 'left-0' : 'right-0'
          )}
        >
          <ul className="py-1">
            {supportedLanguages.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors',
                    currentLang === lang.code
                      ? 'bg-blue-50 text-[#0A66C2] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {lang.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
