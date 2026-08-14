import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Wrench, ImagePlus, X, Save } from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { ServiceCreate, ServiceCategory, ServicePriceType } from '@/types';
import { formatSalaryForInput, formatSalaryInputAsTyped, parseSalaryInput, getServiceImageUrl } from '@/utils';
import { SERVICE_CATEGORIES, SERVICE_PRICE_TYPES } from '../constants';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function EditServicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | undefined>();
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ServiceCreate>({
    title: '',
    description: '',
    location: '',
    category: 'other',
    priceCurrency: 'UZS',
    priceType: 'negotiable',
  });
  const [priceMinDisplay, setPriceMinDisplay] = useState('');
  const [priceMaxDisplay, setPriceMaxDisplay] = useState('');

  useEffect(() => {
    if (id) load();
  }, [id]);

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const load = async () => {
    try {
      setLoadingService(true);
      const item = await serviceService.getService(id!);
      setFormData({
        title: item.title,
        description: item.description,
        location: item.location,
        category: item.category,
        priceMin: item.priceMin,
        priceMax: item.priceMax,
        priceCurrency: item.priceCurrency || 'UZS',
        priceType: item.priceType,
        status: item.status,
      });
      setPriceMinDisplay(formatSalaryForInput(item.priceMin));
      setPriceMaxDisplay(formatSalaryForInput(item.priceMax));
      setExistingImage(item.image);
      const url = getServiceImageUrl(item);
      if (url) setLogoPreview(url);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.editService.failedToLoad'));
    } finally {
      setLoadingService(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(t('pages.createService.imageInvalidType'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t('pages.createService.imageTooLarge'));
      return;
    }
    if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
    setError(null);
  };

  const clearLogo = () => {
    if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (existingImage) setRemoveExistingImage(true);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updated = await serviceService.updateService(Number(id), {
        ...formData,
        priceMin: parseSalaryInput(priceMinDisplay),
        priceMax: parseSalaryInput(priceMaxDisplay),
      });
      if (logoFile) {
        await serviceService.uploadServiceImage(updated.id, logoFile);
      } else if (removeExistingImage && existingImage) {
        await serviceService.deleteServiceImage(updated.id);
      }
      navigate(`/services/${id}`);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
      else setError(err.response?.data?.detail || t('pages.editService.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingService) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 lg:py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link to={`/services/${id}`} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('pages.editService.back')}
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6">{t('pages.editService.title')}</h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border flex items-center justify-center">
              {logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-cover" /> : <Wrench className="h-8 w-8 text-slate-400" />}
            </div>
            <div>
              <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleLogoSelect} className="hidden" />
              <button type="button" onClick={() => logoInputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg">
                <ImagePlus className="h-4 w-4" />
                {t('pages.createService.imageChange')}
              </button>
              {logoPreview && (
                <button type="button" onClick={clearLogo} className="ml-2 text-sm text-slate-600">
                  <X className="h-4 w-4 inline" /> {t('pages.createService.imageRemove')}
                </button>
              )}
            </div>
          </div>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
            placeholder={t('pages.createService.serviceTitle')}
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg resize-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{t(`pages.serviceCategory.${c.labelKey}`)}</option>
              ))}
            </select>
            <input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={formData.priceType}
              onChange={(e) => setFormData({ ...formData, priceType: e.target.value as ServicePriceType })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {SERVICE_PRICE_TYPES.map((p) => (
                <option key={p.value} value={p.value}>{t(`pages.servicePriceType.${p.labelKey}`)}</option>
              ))}
            </select>
            <input
              type="text"
              inputMode="numeric"
              value={priceMinDisplay}
              onChange={(e) => setPriceMinDisplay(formatSalaryInputAsTyped(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
              placeholder="150.000"
            />
            <input
              type="text"
              inputMode="numeric"
              value={priceMaxDisplay}
              onChange={(e) => setPriceMaxDisplay(formatSalaryInputAsTyped(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
              placeholder="500.000"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
            <Save className="h-4 w-4" />
            {loading ? t('pages.editService.saving') : t('pages.editService.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
