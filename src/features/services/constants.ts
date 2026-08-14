import { ServiceCategory, ServicePriceType } from '@/types';

export const SERVICE_CATEGORIES: { value: ServiceCategory; labelKey: string }[] = [
  { value: 'plumber', labelKey: 'plumber' },
  { value: 'electrician', labelKey: 'electrician' },
  { value: 'cleaner', labelKey: 'cleaner' },
  { value: 'handyman', labelKey: 'handyman' },
  { value: 'painter', labelKey: 'painter' },
  { value: 'nanny', labelKey: 'nanny' },
  { value: 'tutor', labelKey: 'tutor' },
  { value: 'driver', labelKey: 'driver' },
  { value: 'beauty', labelKey: 'beauty' },
  { value: 'other', labelKey: 'other' },
];

export const SERVICE_PRICE_TYPES: { value: ServicePriceType; labelKey: string }[] = [
  { value: 'hourly', labelKey: 'hourly' },
  { value: 'fixed', labelKey: 'fixed' },
  { value: 'negotiable', labelKey: 'negotiable' },
];
