import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

/**
 * 安全的会话 Hook，避免 SSR 水合错误
 * 确保服务器端和客户端渲染一致
 */
export function useSafeSession() {
  const { data: session, refetch } = authClient.useSession();
  const [isClient, setIsClient] = useState(false);
  const [safeSession, setSafeSession] = useState(session);

  // 确保客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 更新安全会话数据
  useEffect(() => {
    if (isClient) {
      setSafeSession(session);
    }
  }, [session, isClient]);

  return {
    session: safeSession,
    refetch,
    isClient,
    isLoading: !isClient,
  };
} 