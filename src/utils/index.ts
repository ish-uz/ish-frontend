import i18n from '@/i18n';
import { getUploadsUrl } from '@/lib/utils';

// Date formatting
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat(i18n.language || 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat(i18n.language || 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return i18n.t('common.relativeTime.justNow');
  }
  if (diffInSeconds < 3600) {
    return i18n.t('common.relativeTime.minutesAgo', {
      count: Math.floor(diffInSeconds / 60),
    });
  }
  if (diffInSeconds < 86400) {
    return i18n.t('common.relativeTime.hoursAgo', {
      count: Math.floor(diffInSeconds / 3600),
    });
  }
  if (diffInSeconds < 604800) {
    return i18n.t('common.relativeTime.daysAgo', {
      count: Math.floor(diffInSeconds / 86400),
    });
  }
  if (diffInSeconds < 2592000) {
    return i18n.t('common.relativeTime.weeksAgo', {
      count: Math.floor(diffInSeconds / 604800),
    });
  }

  return formatDateShort(date);
}

// String formatting
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Salary formatting
export function formatSalary(
  min: number,
  max: number,
  currency: string = 'USD'
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

/** Format number for salary input with dots as thousand separators (e.g. 2500000 -> "2.500.000") */
export function formatSalaryForInput(value: number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const s = String(Math.max(0, Math.floor(value)));
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Parse salary from input: "2.500.000", "2 500 000", "2500000" -> 2500000 */
export function parseSalaryInput(input: string): number | undefined {
  const s = input.replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '').trim();
  if (!s) return undefined;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? undefined : n;
}

/** Live-format a salary/price field with thousand dots as the user types. */
export function formatSalaryInputAsTyped(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  return formatSalaryForInput(parseInt(digits, 10));
}

// Validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// URL helpers
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Job post image, falling back to linked company logo. */
export function getJobImageUrl(job: { image?: string; company?: { logo?: string } }): string | undefined {
  const src = job.image || job.company?.logo;
  if (!src) return undefined;
  return getUploadsUrl(src);
}

/** Post image, falling back to linked company logo. */
export function getPostImageUrl(post: { image?: string; company?: { logo?: string } }): string | undefined {
  const src = post.image || post.company?.logo;
  if (!src) return undefined;
  return getUploadsUrl(src);
}

export function getServiceImageUrl(service: { image?: string }): string | undefined {
  if (!service.image) return undefined;
  return getUploadsUrl(service.image);
}
