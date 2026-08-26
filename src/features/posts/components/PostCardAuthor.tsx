import { Link } from 'react-router-dom';
import { Post } from '@/types';
import { getInitials } from '@/utils';
import { getUploadsUrl } from '@/lib/utils';

interface PostCardAuthorProps {
  post: Post;
  to?: string;
}

export function PostCardAuthor({ post, to }: PostCardAuthorProps) {
  const authorName = post.author
    ? `${post.author.firstName} ${post.author.lastName}`.trim()
    : null;
  const displayName = post.company?.name || authorName || '—';
  const avatarSrc = post.company?.logo
    ? getUploadsUrl(post.company.logo)
    : post.author?.avatar
      ? getUploadsUrl(post.author.avatar)
      : null;
  const initials = post.company?.name
    ? post.company.name.slice(0, 2).toUpperCase()
    : post.author
      ? getInitials(post.author.firstName || '', post.author.lastName || '')
      : '?';

  const meta = (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center flex-shrink-0">
        {avatarSrc ? (
          <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[11px] font-semibold text-white">{initials}</span>
        )}
      </div>
      <span className="text-sm font-semibold text-slate-900 truncate">{displayName}</span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="min-w-0 hover:opacity-90 transition-opacity">
        {meta}
      </Link>
    );
  }

  return meta;
}
