import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, Search, Building2, Heart, Calendar, Plus } from 'lucide-react';
import { postService } from '../services/postService';
import { Post } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { formatRelativeTime, getPostImageUrl } from '@/utils';

export function PostsPage() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const itemsPerPage = 20;
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    loadPosts();
  }, [currentPage, debouncedSearchQuery]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (currentPage - 1) * itemsPerPage;
      const result = await postService.getPosts(skip, itemsPerPage, debouncedSearchQuery || undefined);
      setPosts(result.posts);
      setTotalItems(result.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.posts.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const excerpt = (text: string, max = 160) =>
    text.length > max ? `${text.slice(0, max).trim()}…` : text;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('pages.posts.title')}</h1>
          <p className="text-slate-600 mt-1">{t('pages.posts.subtitle')}</p>
        </div>
        <Link
          to="/posts/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('pages.posts.createPost')}
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('pages.posts.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          <p className="text-slate-600">{t('pages.posts.empty')}</p>
          <Link to="/posts/create" className="inline-block mt-4 text-blue-600 hover:underline">
            {t('pages.posts.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const imageUrl = getPostImageUrl(post);
            return (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="block bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {imageUrl && (
                    <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-slate-100">
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900 truncate">{post.title}</h2>
                    <p className="mt-2 text-slate-600 text-sm line-clamp-2">{excerpt(post.content)}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      {post.company && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {post.company.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1" title={new Date(post.createdAt).toLocaleString(i18n.language)}>
                        <Calendar className="h-4 w-4" />
                        {formatRelativeTime(post.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likesCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
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
