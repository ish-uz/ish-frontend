import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Building2, ImagePlus, X } from 'lucide-react';
import { postService } from '../services/postService';
import { companyService } from '../../companies/services/companyService';
import { Company, PostCreate } from '@/types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function CreatePostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PostCreate>({
    title: '',
    content: '',
    companyId: undefined,
    status: 'published',
  });

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await companyService.getMyCompanies();
        setCompanies(data);
      } catch {
        // optional
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(t('pages.createPost.imageInvalidType'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t('pages.createPost.imageTooLarge'));
      e.target.value = '';
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError(t('pages.createPost.requiredFields'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await postService.createPost({
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
        companyId: formData.companyId || undefined,
      });
      if (imageFile) {
        try {
          await postService.uploadPostImage(created.id, imageFile);
        } catch {
          // post created; image optional
        }
      }
      navigate(`/posts/${created.id}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.response?.data?.detail || t('pages.createPost.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/posts"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('pages.createPost.back')}
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('pages.createPost.title')}</h1>
      <p className="text-slate-600 mb-8">{t('pages.createPost.subtitle')}</p>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100">
          {typeof error === 'string' ? error : t('pages.createPost.failedToCreate')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-slate-200 p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.createPost.titleLabel')}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={200}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.createPost.contentLabel')}
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {t('pages.createPost.companyLabel')}
            </span>
          </label>
          <select
            value={formData.companyId ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                companyId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            disabled={loadingCompanies}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('pages.createPost.noCompany')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('pages.createPost.imageLabel')}
          </label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="" className="h-40 rounded-lg object-cover border border-slate-200" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-800 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600"
            >
              <ImagePlus className="h-4 w-4" />
              {t('pages.createPost.addImage')}
            </button>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/posts"
            className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {t('pages.createPost.cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? t('pages.createPost.saving') : t('pages.createPost.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
