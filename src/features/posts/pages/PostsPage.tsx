import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, Search, Plus, Calendar } from 'lucide-react';
import { postService } from '../services/postService';
import { Post } from '@/types';
import { Pagination } from '@/components/ui/Pagination';
import { formatRelativeTime, getPostImageUrl } from '@/utils';
import { PostActionsBar } from '../components/PostActionsBar';
import { PostCardAuthor } from '../components/PostCardAuthor';

function PostsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse"
        >
          <div className="h-48 sm:h-56 bg-slate-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-2/3 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-4/5 bg-slate-100 rounded" />
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-slate-200" />
                <div className="h-3.5 w-24 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
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
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <PostsSkeleton />
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
          {posts.map((post, index) => {
            const imageUrl = getPostImageUrl(post);
            return (
              <article
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden animate-fade-up"
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              >
                {imageUrl && (
                  <Link
                    to={`/posts/${post.id}`}
                    className="relative block w-full h-48 sm:h-56 bg-slate-900 overflow-hidden"
                  >
                    <img
                      src={imageUrl}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-50"
                    />
                    <img
                      src={imageUrl}
                      alt=""
                      className="relative z-[1] h-full w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </Link>
                )}

                <div className="p-5 flex flex-col">
                  <Link to={`/posts/${post.id}`} className="block group">
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-slate-600 text-sm line-clamp-2 leading-relaxed">
                      {excerpt(post.content)}
                    </p>
                  </Link>

                  <span
                    className="mt-3 inline-flex items-center gap-1 text-sm text-slate-500"
                    title={new Date(post.createdAt).toLocaleString(i18n.language)}
                  >
                    <Calendar className="h-4 w-4" />
                    {formatRelativeTime(post.createdAt)}
                  </span>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <PostCardAuthor post={post} to={`/posts/${post.id}`} />
                    <PostActionsBar
                      postId={post.id}
                      likesCount={post.likesCount}
                      liked={post.liked}
                      className="flex-shrink-0"
                      onChange={({ liked, likesCount }) =>
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id ? { ...p, liked, likesCount } : p,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              </article>
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
