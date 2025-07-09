import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';
import { getBaseUrl } from './urls/urls';

/**
 * https://www.better-auth.com/docs/installation#create-client-instance
 */
export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    // https://www.better-auth.com/docs/plugins/admin#add-the-client-plugin
    adminClient(),
    // https://www.better-auth.com/docs/concepts/typescript#inferring-additional-fields-on-client
    inferAdditionalFields<typeof auth>(),
  ],
  // 确保客户端不会缓存过期的会话
  session: {
    refetchInterval: 0, // 禁用自动重新获取
    refetchOnWindowFocus: true, // 窗口聚焦时重新获取
  },
});
