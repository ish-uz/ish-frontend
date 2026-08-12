import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit2,
  Trash2,
  Heart,
  Share2,
  Check,
} from 'lucide-react';
import { postService } from '../services/postService';
import { userService } from '@/features/users/services/userService';
import { Post, User } from '@/types';
import { getPostImageUrl } from '@/utils';

export function PostDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost();
      loadCurrentUser();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postService.getPost(id!);
      setPost(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.postDetails.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        setCurrentUser(await userService.getCurrentUser());
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const isOwner = !!(currentUser && post && currentUser.id === post.authorId);

  const handleLikeToggle = async () => {
    if (!post || !id) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      setLiking(true);
      if (post.liked) {
        await postService.unlikePost(Number(id));
        setPost({
          ...post,
          liked: false,
          likesCount: Math.max(0, post.likesCount - 1),
        });
      } else {
        await postService.likePost(Number(id));
        setPost({
          ...post,
          liked: true,
          likesCount: post.likesCount + 1,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.postDetails.failedToLike'));
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setError(t('pages.postDetails.failedToCopy'));
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm(t('pages.postDetails.confirmDelete'))) return;
    try {
      setDeleting(true);
      await postService.deletePost(post.id);
      navigate('/posts/my');
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.postDetails.failedToDelete'));
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-100">{error}</div>
        <Link to="/posts" className="inline-flex items-center gap-2 mt-4 text-blue-600">
          <ArrowLeft className="h-4 w-4" />
          {t('pages.postDetails.back')}
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const imageUrl = getPostImageUrl(post);
  const authorName = post.author
    ? `${post.author.firstName} ${post.author.lastName}`
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/posts"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('pages.postDetails.back')}
      </Link>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100">
          {typeof error === 'string' ? error : t('pages.postDetails.failedToLoad')}
        </div>
      )}

      <article className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {imageUrl && (
          <div className="w-full max-h-80 bg-slate-100">
            <img src={imageUrl} alt="" className="w-full h-full max-h-80 object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{post.title}</h1>
            {isOwner && (
              <div className="flex gap-2">
                <Link
                  to={`/posts/${post.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Edit2 className="h-4 w-4" />
                  {t('pages.postDetails.edit')}
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('pages.postDetails.delete')}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-6">
            {post.company && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {post.company.name}
              </span>
            )}
            {authorName && <span>{authorName}</span>}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.createdAt)}
            </span>
          </div>

          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
            {post.content}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLikeToggle}
              disabled={liking}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors disabled:opacity-50 ${
                post.liked
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
              {post.likesCount} {t('pages.postDetails.likes')}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {shareCopied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
              {shareCopied ? t('pages.postDetails.linkCopied') : t('pages.postDetails.share')}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
