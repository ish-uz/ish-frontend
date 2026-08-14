import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, MapPin, DollarSign, Eye, Calendar, User, Wrench, MessageCircle, Pencil
} from 'lucide-react';
import { serviceService } from '../services/serviceService';
import { userService } from '@/features/users/services/userService';
import { invitationService } from '@/features/users/services/invitationService';
import { chatService } from '@/features/chat/services/chatService';
import { ServiceListing, User as UserType, ChatWithUserResponse } from '@/types';
import { getServiceImageUrl } from '@/utils';

export function ServiceDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceListing | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null);
  const viewsIncrementedRef = useRef<string | null>(null);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [chatStatus, setChatStatus] = useState<ChatWithUserResponse | null>(null);
  const [messageModalLoading, setMessageModalLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      if (viewsIncrementedRef.current !== id) {
        viewsIncrementedRef.current = null;
      }
      loadService();
      loadCurrentUser();
    }
    return () => {
      if (loadingRef.current === id) loadingRef.current = null;
    };
  }, [id]);

  const loadService = async () => {
    if (loadingRef.current === id) return;
    try {
      loadingRef.current = id!;
      setLoading(true);
      const data = await serviceService.getService(id!);
      setService(data);
      if (viewsIncrementedRef.current !== id) {
        viewsIncrementedRef.current = id!;
        serviceService.incrementViews(data.id).catch(() => {});
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.serviceDetails.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  const isOwner = !!(currentUser && service && currentUser.id === service.authorId);

  const formatPrice = () => {
    if (!service) return '';
    const currency = service.priceCurrency || 'UZS';
    const typeLabel = t(`pages.servicePriceType.${service.priceType}`);
    if (!service.priceMin && !service.priceMax) return typeLabel;
    if (service.priceMin && service.priceMax) {
      return `${service.priceMin.toLocaleString()} – ${service.priceMax.toLocaleString()} ${currency} · ${typeLabel}`;
    }
    if (service.priceMin) return `${service.priceMin.toLocaleString()}+ ${currency} · ${typeLabel}`;
    return `≤ ${service.priceMax!.toLocaleString()} ${currency} · ${typeLabel}`;
  };

  const openMessageModal = async () => {
    if (!service?.author) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowMessageModal(true);
    setChatStatus(null);
    setInviteMessage('');
    setInviteError(null);
    setMessageModalLoading(true);
    try {
      const status = await chatService.getChatWithUser(service.author.id);
      setChatStatus(status);
    } catch (err: any) {
      setInviteError(err.response?.data?.detail || t('pages.employees.failedToLoad'));
    } finally {
      setMessageModalLoading(false);
    }
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setChatStatus(null);
    setInviteMessage('');
    setInviteError(null);
  };

  const handleSendInvitation = async () => {
    if (!service?.author) return;
    setInviteSending(true);
    setInviteError(null);
    try {
      await invitationService.create(service.author.id, inviteMessage.trim() || undefined);
      setChatStatus((prev) => ({
        ...prev!,
        pendingInvitationFromMe: {
          id: 0,
          fromUserId: currentUser!.id,
          toUserId: service.author!.id,
          message: inviteMessage.trim() || undefined,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      }));
    } catch (err: any) {
      setInviteError(err.response?.data?.detail || t('pages.employees.failedToSendInvite'));
    } finally {
      setInviteSending(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: number) => {
    setInviteSending(true);
    setInviteError(null);
    try {
      const inv = await invitationService.accept(invitationId);
      if (inv.conversationId) {
        window.dispatchEvent(new Event('ish:refresh-invitation-unread'));
        closeMessageModal();
        navigate(`/chat/${inv.conversationId}`);
      }
    } catch (err: any) {
      setInviteError(err.response?.data?.detail || t('pages.employees.failedToLoad'));
    } finally {
      setInviteSending(false);
    }
  };

  const handleOpenChat = () => {
    if (chatStatus?.conversation?.id) {
      closeMessageModal();
      navigate(`/chat/${chatStatus.conversation.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-32"></div>
          <div className="bg-white rounded-2xl p-6 h-64"></div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || t('pages.serviceDetails.notFound')}</p>
          <Link to="/services" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t('pages.serviceDetails.back')}
          </Link>
        </div>
      </div>
    );
  }

  const authorName = service.author
    ? `${service.author.firstName} ${service.author.lastName}`
    : t('pages.serviceDetails.provider');

  return (
    <div className="min-h-screen bg-slate-50 py-4 lg:py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/services"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('pages.serviceDetails.back')}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {getServiceImageUrl(service) && (
            <img src={getServiceImageUrl(service)} alt="" className="w-full h-56 object-cover" />
          )}
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div className="flex-1">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 mb-3">
                  <Wrench className="h-4 w-4 mr-1.5" />
                  {t(`pages.serviceCategory.${service.category}`)}
                </span>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{service.title}</h1>
                <p className="text-slate-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {authorName}
                </p>
              </div>
              {isOwner ? (
                <Link
                  to={`/services/${service.id}/edit`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-medium"
                >
                  <Pencil className="h-4 w-4" />
                  {t('pages.serviceDetails.edit')}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openMessageModal}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('pages.serviceDetails.contact')}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                <MapPin className="h-4 w-4 mr-1.5" />
                {service.location}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                <DollarSign className="h-4 w-4 mr-1.5" />
                {formatPrice()}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                <Calendar className="h-4 w-4 mr-1.5" />
                {new Date(service.createdAt).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                <Eye className="h-4 w-4 mr-1.5" />
                {service.viewsCount} {t('pages.serviceDetails.views')}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('pages.serviceDetails.description')}</h2>
            <p className="text-slate-700 whitespace-pre-wrap">{service.description}</p>
          </div>
        </div>
      </div>

      {showMessageModal && service.author && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">
              {t('pages.serviceDetails.contact')} — {authorName}
            </h3>
            {messageModalLoading ? (
              <p className="text-gray-500 py-4">{t('pages.employees.loadingShort')}</p>
            ) : inviteError ? (
              <p className="text-red-600 py-2">{inviteError}</p>
            ) : chatStatus?.conversation ? (
              <div>
                <p className="text-gray-600 mb-4">{t('pages.employees.alreadyHaveChat')}</p>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {t('pages.employees.openChat')}
                </button>
              </div>
            ) : chatStatus?.pendingInvitationFromThem ? (
              <div>
                <p className="text-gray-600 mb-4">{t('pages.employees.theySentInvitation')}</p>
                <button
                  type="button"
                  onClick={() => handleAcceptInvitation(chatStatus.pendingInvitationFromThem!.id)}
                  disabled={inviteSending}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {t('pages.employees.accept')}
                </button>
              </div>
            ) : chatStatus?.pendingInvitationFromMe ? (
              <p className="text-gray-600">{t('pages.employees.invitationSent')}</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-3">{t('pages.employees.sendInvitationDesc')}</p>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder={t('pages.employees.optionalMessage')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendInvitation}
                    disabled={inviteSending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    {inviteSending ? t('pages.employees.sending') : t('pages.employees.sendInvite')}
                  </button>
                  <button type="button" onClick={closeMessageModal} className="px-4 py-2 border border-gray-300 rounded-lg">
                    {t('pages.employees.cancel')}
                  </button>
                </div>
              </div>
            )}
            {(chatStatus?.conversation || chatStatus?.pendingInvitationFromMe) && (
              <button type="button" onClick={closeMessageModal} className="mt-3 w-full text-sm text-slate-500">
                {t('pages.employees.cancel')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
