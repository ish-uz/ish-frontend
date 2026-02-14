import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { invitationService } from '../services/invitationService';
import { ChatInvitation } from '@/types';
import { User as UserIcon, Mail, Check, X, MessageCircle, Send } from 'lucide-react';

type Tab = 'received' | 'sent';

export function InvitationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('received');
  const [received, setReceived] = useState<ChatInvitation[]>([]);
  const [sent, setSent] = useState<ChatInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadReceived = async () => {
    const { items } = await invitationService.listReceived(0, 100);
    setReceived(items.filter((i) => i.status === 'pending'));
  };

  const loadSent = async () => {
    const { items } = await invitationService.list({ received: false, sent: true, limit: 100 });
    setSent(items.filter((i) => i.status === 'pending'));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([loadReceived(), loadSent()])
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.detail || t('pages.invitations.failedToLoad'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleAccept = async (inv: ChatInvitation) => {
    setActionLoading(inv.id);
    try {
      const updated = await invitationService.accept(inv.id);
      setReceived((prev) => prev.filter((i) => i.id !== inv.id));
      if (updated.conversationId) {
        navigate(`/chat/${updated.conversationId}`);
      }
    } catch (err) {
      setError((err as any)?.response?.data?.detail || t('pages.invitations.failedToAccept'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (inv: ChatInvitation) => {
    setActionLoading(inv.id);
    try {
      await invitationService.reject(inv.id);
      setReceived((prev) => prev.filter((i) => i.id !== inv.id));
    } catch (err) {
      setError((err as any)?.response?.data?.detail || t('pages.invitations.failedToReject'));
    } finally {
      setActionLoading(null);
    }
  };

  const displayUser = (inv: ChatInvitation, isFrom: boolean) => {
    const u = isFrom ? inv.fromUser : inv.toUser;
    if (!u) return 'Unknown';
    return `${u.firstName} ${u.lastName}`.trim() || 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">{t('pages.invitations.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-6">
          <MessageCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{t('pages.invitations.title')}</h1>
        </div>
        <p className="text-gray-600 mb-6">
          {t('pages.invitations.subtitle')}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setTab('received')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              tab === 'received'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('pages.invitations.received')} ({received.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('sent')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              tab === 'sent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('pages.invitations.sent')} ({sent.length})
          </button>
        </div>

        {tab === 'received' && (
          <div className="space-y-4">
            {received.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <Mail className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">{t('pages.invitations.noPending')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('pages.invitations.noPendingDesc')}</p>
              </div>
            ) : (
              received.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl shadow-md p-4 flex items-start gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{displayUser(inv, true)} {t('pages.invitations.wantsToChat')}</p>
                    {inv.message && (
                      <p className="text-sm text-gray-600 mt-1">&ldquo;{inv.message}&rdquo;</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAccept(inv)}
                      disabled={actionLoading === inv.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {actionLoading === inv.id ? '...' : t('pages.invitations.accept')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(inv)}
                      disabled={actionLoading === inv.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      {t('pages.invitations.reject')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'sent' && (
          <div className="space-y-4">
            {sent.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <Send className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">{t('pages.invitations.noSent')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('pages.invitations.noSentDesc')}</p>
              </div>
            ) : (
              sent.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{t('pages.invitations.invitationTo')} {displayUser(inv, false)}</p>
                    {inv.message && (
                      <p className="text-sm text-gray-600 mt-1">&ldquo;{inv.message}&rdquo;</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t('pages.invitations.sentDatePending', { date: new Date(inv.createdAt).toLocaleDateString() })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
