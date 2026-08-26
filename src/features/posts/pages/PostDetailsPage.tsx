import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Trash2,
} from 'lucide-react';
import { postService } from '../services/postService';
import { userService } from '@/features/users/services/userService';
import { Post, User } from '@/types';
import { formatRelativeTime, getPostImageUrl } from '@/utils';
import { PostActionsBar } from '../components/PostActionsBar';
import { PostCardAuthor } from '../components/PostCardAuthor';

export function PostDetailsPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      <article className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-up">
        {imageUrl && (
          <div className="relative w-full h-56 sm:h-72 md:h-80 bg-slate-900 overflow-hidden">
            <img
              src={imageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-50"
            />
            <img
              src={imageUrl}
              alt=""
              className="relative z-[1] h-full w-full object-contain"
            />
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

          <span
            className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6"
            title={new Date(post.createdAt).toLocaleString(i18n.language)}
          >
            <Calendar className="h-4 w-4" />
            {formatRelativeTime(post.createdAt)}
          </span>

          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
            {post.content}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <PostCardAuthor post={post} />
            <PostActionsBar
              postId={post.id}
              likesCount={post.likesCount}
              liked={post.liked}
              className="flex-shrink-0"
              onChange={({ liked, likesCount }) =>
                setPost((prev) => (prev ? { ...prev, liked, likesCount } : prev))
              }
            />
          </div>
        </div>
      </article>
    </div>
  );
}
