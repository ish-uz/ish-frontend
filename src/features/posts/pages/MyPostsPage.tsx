import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Newspaper,
  Plus,
  Heart,
  Calendar,
  Edit2,
  Trash2,
  Building2,
} from 'lucide-react';
import { postService } from '../services/postService';
import { Pagination } from '@/components/ui/Pagination';
import { Post } from '@/types';
import { formatRelativeTime, getPostImageUrl } from '@/utils';

export function MyPostsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (currentPage - 1) * itemsPerPage;
      const result = await postService.getMyPosts(skip, itemsPerPage);
      setPosts(result.posts);
      setTotalItems(result.total);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.detail || t('pages.myPosts.failedToLoad'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('pages.myPosts.confirmDelete'))) return;
    try {
      await postService.deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
      setTotalItems((n) => Math.max(0, n - 1));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.myPosts.failedToDelete'));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('pages.myPosts.title')}</h1>
          <p className="text-slate-600 mt-1">{t('pages.myPosts.subtitle')}</p>
        </div>
        <Link
          to="/posts/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {t('pages.myPosts.createPost')}
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Newspaper className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">{t('pages.myPosts.empty')}</p>
          <Link to="/posts/create" className="inline-block mt-4 text-blue-600 hover:underline">
            {t('pages.myPosts.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const imageUrl = getPostImageUrl(post);
            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-4"
              >
                {imageUrl && (
                  <Link to={`/posts/${post.id}`} className="sm:w-28 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link to={`/posts/${post.id}`} className="font-semibold text-slate-900 hover:text-blue-600 truncate">
                      {post.title}
                    </Link>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {post.status === 'published'
                        ? t('pages.posts.statusPublished')
                        : t('pages.posts.statusDraft')}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                    {post.company && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {post.company.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1" title={new Date(post.createdAt).toLocaleString(i18n.language)}>
                      <Calendar className="h-3.5 w-3.5" />
                      {formatRelativeTime(post.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {post.likesCount}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/posts/${post.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      {t('pages.myPosts.edit')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('pages.myPosts.delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalItems > itemsPerPage && (
        <div className="mt-8">
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
  );
}
