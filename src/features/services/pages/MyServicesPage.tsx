import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wrench, Plus, MapPin, Eye, Calendar, Edit2, Trash2, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { Pagination } from '@/components/ui/Pagination';
import { ServiceListing } from '@/types';
import { getServiceImageUrl } from '@/utils';

export function MyServicesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    load();
  }, [currentPage]);

  const load = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      const result = await serviceService.getMyServices(skip, itemsPerPage);
      setServices(result.services);
      setTotalItems(result.total);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
      else setError(err.response?.data?.detail || t('pages.myServices.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('pages.myServices.confirmDelete'))) return;
    try {
      await serviceService.deleteService(id);
      setServices(services.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.myServices.failedToDelete'));
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const updated = await serviceService.updateService(id, { status: 'active' });
      setServices(services.map((s) => (s.id === id ? updated : s)));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.myServices.failedToPublish'));
    }
  };

  const handleClose = async (id: number) => {
    try {
      const updated = await serviceService.updateService(id, { status: 'closed' });
      setServices(services.map((s) => (s.id === id ? updated : s)));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.myServices.failedToClose'));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: t('pages.myServices.statusActive'),
      },
      draft: {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        icon: <Clock className="h-4 w-4" />,
        label: t('pages.myServices.statusDraft'),
      },
      closed: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <XCircle className="h-4 w-4" />,
        label: t('pages.myServices.statusClosed'),
      },
    };
    return badges[status] || badges.draft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Wrench className="h-7 w-7 text-blue-600" />
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{t('pages.myServices.title')}</h1>
            </div>
            <p className="text-slate-600 text-sm">{t('pages.myServices.subtitle')}</p>
          </div>
          <Link
            to="/services/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            {t('pages.services.postService')}
          </Link>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {services.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-600">{t('pages.myServices.empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4">
                  {getServiceImageUrl(item) ? (
                    <img src={getServiceImageUrl(item)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Wrench className="h-7 w-7 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/services/${item.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                      <span className="inline-flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" />{item.location}</span>
                      <span className="inline-flex items-center"><Eye className="h-3.5 w-3.5 mr-1" />{item.viewsCount}</span>
                      <span className="inline-flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" />{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Link to={`/services/${item.id}/edit`} className="inline-flex items-center gap-1 text-sm text-blue-600">
                        <Edit2 className="h-4 w-4" /> {t('pages.myServices.edit')}
                      </Link>
                      {item.status !== 'active' && (
                        <button type="button" onClick={() => handlePublish(item.id)} className="text-sm text-green-600">
                          {t('pages.myServices.publish')}
                        </button>
                      )}
                      {item.status === 'active' && (
                        <button type="button" onClick={() => handleClose(item.id)} className="text-sm text-orange-600">
                          {t('pages.myServices.close')}
                        </button>
                      )}
                      <button type="button" onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-1 text-sm text-red-600">
                        <Trash2 className="h-4 w-4" /> {t('pages.myServices.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalItems > itemsPerPage && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
