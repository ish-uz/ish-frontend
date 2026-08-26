import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Share, Check } from 'lucide-react';
import { postService } from '../services/postService';

interface PostActionsBarProps {
  postId: number;
  likesCount: number;
  liked?: boolean;
  onChange?: (next: { liked: boolean; likesCount: number }) => void;
  className?: string;
}

export function PostActionsBar({
  postId,
  likesCount,
  liked = false,
  onChange,
  className = '',
}: PostActionsBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [liking, setLiking] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(liked);
  const [count, setCount] = useState(likesCount);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    setIsLiked(liked);
    setCount(likesCount);
  }, [liked, likesCount, postId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liking) return;

    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = count;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    setIsLiked(nextLiked);
    setCount(nextCount);
    if (nextLiked) {
      setPop(true);
      window.setTimeout(() => setPop(false), 350);
    }
    onChange?.({ liked: nextLiked, likesCount: nextCount });

    try {
      setLiking(true);
      if (nextLiked) {
        await postService.likePost(postId);
      } else {
        await postService.unlikePost(postId);
      }
    } catch {
      setIsLiked(prevLiked);
      setCount(prevCount);
      onChange?.({ liked: prevLiked, likesCount: prevCount });
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      className={`flex items-center gap-5 text-slate-600 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleLike}
        disabled={liking}
        aria-label={t('pages.postDetails.likes')}
        aria-pressed={isLiked}
        className={`inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 active:scale-95 ${
          isLiked ? 'text-rose-500' : 'hover:text-rose-500'
        }`}
      >
        <Heart
          className={`h-[22px] w-[22px] stroke-[1.5] ${isLiked ? 'fill-current' : ''} ${
            pop ? 'animate-heart-pop' : ''
          }`}
        />
        <span className="text-[15px] font-medium tabular-nums leading-none">
          {count}
        </span>
      </button>

      <button
        type="button"
        onClick={handleShare}
        aria-label={shareCopied ? t('pages.postDetails.linkCopied') : t('pages.postDetails.share')}
        title={shareCopied ? t('pages.postDetails.linkCopied') : t('pages.postDetails.share')}
        className={`inline-flex items-center transition-all active:scale-95 ${
          shareCopied ? 'text-emerald-600' : 'hover:text-slate-900'
        }`}
      >
        {shareCopied ? (
          <Check className="h-[22px] w-[22px] stroke-[1.5]" />
        ) : (
          <Share className="h-[22px] w-[22px] stroke-[1.5]" />
        )}
      </button>
    </div>
  );
}
