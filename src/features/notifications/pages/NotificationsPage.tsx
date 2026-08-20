import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { useChatWebSocket } from '@/features/chat/hooks/useChatWebSocket';
import {
  notificationService,
  type InboxNotification,
} from '../services/notificationService';

const PAGE_SIZE = 20;

function notificationUrl(item: InboxNotification): string {
  const url = item.data?.url;
  return typeof url === 'string' && url.startsWith('/') ? url : '/dashboard';
}

export function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useChatWebSocket({
    onNotification: (data) => {
      const incoming = data as unknown as InboxNotification;
      if (!incoming?.id) return;
      setTotal((n) => n + 1);
      if (!incoming.isRead) {
        setUnreadCount((c) => c + 1);
      }
      setCurrentPage((page) => {
        if (page === 1) {
          setItems((prev) => {
            if (prev.some((n) => n.id === incoming.id)) return prev;
            return [incoming, ...prev].slice(0, PAGE_SIZE);
          });
        }
        return page;
      });
    },
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const skip = (currentPage - 1) * PAGE_SIZE;
    notificationService
      .list(skip, PAGE_SIZE)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
        setUnreadCount(result.unreadCount);
        const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
        if (currentPage > lastPage) {
          setCurrentPage(lastPage);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.detail || t('pages.notifications.failedToLoad'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t, currentPage]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(i18n.language, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpen = async (item: InboxNotification) => {
    if (!item.isRead) {
      try {
        await notificationService.markRead(item.id);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // still navigate
      }
    }
    navigate(notificationUrl(item));
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(detail || t('pages.notifications.failedToMarkAll'));
    } finally {
      setMarkingAll(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && items.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
          <p className='mt-4 text-gray-600'>
            {t('pages.notifications.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-start justify-between gap-4 mb-6'>
          <div>
            <div className='flex items-center space-x-3 mb-2'>
              <Bell className='h-8 w-8 text-blue-600' />
              <h1 className='text-2xl font-bold text-gray-900'>
                {t('pages.notifications.title')}
              </h1>
            </div>
            <p className='text-gray-600'>{t('pages.notifications.subtitle')}</p>
          </div>
          {unreadCount > 0 && (
            <button
              type='button'
              onClick={handleMarkAll}
              disabled={markingAll}
              className='inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50'
            >
              <CheckCheck className='h-4 w-4' />
              {t('pages.notifications.markAllRead')}
            </button>
          )}
        </div>

        {error && (
          <div className='mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm'>
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className='bg-white rounded-xl border border-slate-200 p-10 text-center'>
            <Bell className='h-10 w-10 text-slate-300 mx-auto mb-3' />
            <p className='font-medium text-slate-900'>
              {t('pages.notifications.empty')}
            </p>
            <p className='text-sm text-slate-500 mt-1'>
              {t('pages.notifications.emptyDesc')}
            </p>
          </div>
        ) : (
          <>
            <div
              className={`bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 ${
                loading ? 'opacity-60' : ''
              }`}
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => handleOpen(item)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                    item.isRead ? 'bg-white' : 'bg-blue-50/60'
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    {!item.isRead && (
                      <span className='mt-2 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0' />
                    )}
                    <div
                      className={`flex-1 min-w-0 ${item.isRead ? 'pl-5' : ''}`}
                    >
                      <p className='text-sm font-semibold text-slate-900'>
                        {item.title}
                      </p>
                      <p className='text-sm text-slate-600 mt-0.5'>
                        {item.body}
                      </p>
                      <p className='text-xs text-slate-400 mt-1'>
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(total / PAGE_SIZE)}
              onPageChange={handlePageChange}
              totalItems={total}
              itemsPerPage={PAGE_SIZE}
            />
          </>
        )}
      </div>
    </div>
  );
}
