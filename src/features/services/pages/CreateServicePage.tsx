import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Wrench, ImagePlus, X, Save } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { ServiceCreate, ServiceCategory, ServicePriceType } from '@/types';
import { formatSalaryInputAsTyped, parseSalaryInput } from '@/utils';
import { SERVICE_CATEGORIES, SERVICE_PRICE_TYPES } from '../constants';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function CreateServicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ServiceCreate>({
    title: '',
    description: '',
    location: '',
    category: 'plumber',
    priceCurrency: 'UZS',
    priceType: 'negotiable',
    status: 'active',
  });
  const [priceMinDisplay, setPriceMinDisplay] = useState('');
  const [priceMaxDisplay, setPriceMaxDisplay] = useState('');

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(t('pages.createService.imageInvalidType'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t('pages.createService.imageTooLarge'));
      e.target.value = '';
      return;
    }
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const clearLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError(t('pages.createService.titleRequired'));
      return;
    }
    if (!formData.description.trim()) {
      setError(t('pages.createService.descriptionRequired'));
      return;
    }
    if (!formData.location.trim()) {
      setError(t('pages.createService.locationRequired'));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const created = await serviceService.createService({
        ...formData,
        priceMin: parseSalaryInput(priceMinDisplay),
        priceMax: parseSalaryInput(priceMaxDisplay),
      });
      if (logoFile) {
        await serviceService.uploadServiceImage(created.id, logoFile);
      }
      navigate('/services/my');
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || t('pages.createService.createFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 lg:py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/services" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 group">
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('pages.createService.back')}
        </Link>
        <div className="flex items-center space-x-3 mb-6">
          <Wrench className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('pages.createService.title')}</h1>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pages.createService.imageOptional')}</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border flex items-center justify-center">
                {logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-cover" /> : <Wrench className="h-8 w-8 text-slate-400" />}
              </div>
              <div>
                <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleLogoSelect} className="hidden" />
                <button type="button" onClick={() => logoInputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                  <ImagePlus className="h-4 w-4" />
                  {logoPreview ? t('pages.createService.imageChange') : t('pages.createService.imageChoose')}
                </button>
                {logoPreview && (
                  <button type="button" onClick={clearLogo} className="ml-2 inline-flex items-center gap-1 px-3 py-2 text-sm text-slate-600">
                    <X className="h-4 w-4" />
                    {t('pages.createService.imageRemove')}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pages.createService.serviceTitle')}</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pages.createService.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pages.createService.category')}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white"
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{t(`pages.serviceCategory.${c.labelKey}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pages.createService.location')}</label>
              <input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('pages.services.locationPlaceholder')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pages.createService.priceType')}</label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value as ServicePriceType })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white"
              >
                {SERVICE_PRICE_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>{t(`pages.servicePriceType.${p.labelKey}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pages.createService.priceMin')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={priceMinDisplay}
                onChange={(e) => setPriceMinDisplay(formatSalaryInputAsTyped(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
                placeholder="150.000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('pages.createService.priceMax')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={priceMaxDisplay}
                onChange={(e) => setPriceMaxDisplay(formatSalaryInputAsTyped(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
                placeholder="500.000"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? t('pages.createService.saving') : t('pages.createService.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
