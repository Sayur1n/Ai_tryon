'use client';

import { UpdateAvatarCard } from './update-avatar-card';
import { UpdateNameCard } from './update-name-card';
import { useEffect, useState } from 'react';

interface ProfilePageClientProps {
  className?: string;
}

/**
 * 客户端专用的个人资料页面组件
 * 避免 SSR 水合问题
 */
export function ProfilePageClient({ className }: ProfilePageClientProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 在客户端渲染之前显示加载状态
  if (!isClient) {
    return (
      <div className={`flex flex-col gap-8 ${className || ''}`}>
        <div className="w-full max-w-lg md:max-w-xl h-64 bg-muted animate-pulse rounded-lg" />
        <div className="w-full max-w-lg md:max-w-xl h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-8 ${className || ''}`}>
      <UpdateAvatarCard />
      <UpdateNameCard />
    </div>
  );
} 