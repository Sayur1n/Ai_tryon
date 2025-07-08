import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { OutfitHistoryList } from '@/components/dashboard/outfit-history-list';
import { getSession } from '@/lib/server';
import { getDb } from '@/db/index';
import { outfitResult } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard.dashboard');
  const session = await getSession();
  if (!session || !session.user) {
    // 未登录直接返回空页面或notFound
    return null;
  }
  const db = await getDb();
  // 查询当前用户的历史换衣记录，按创建时间倒序
  const dbResults = await db.select().from(outfitResult)
    .where(eq(outfitResult.userId, session.user.id))
    .orderBy(desc(outfitResult.createdAt));
  
  // 转换数据库结果以匹配组件期望的类型
  const results = dbResults.map(result => ({
    ...result,
    topGarmentUrl: result.topGarmentUrl || undefined,
    bottomGarmentUrl: result.bottomGarmentUrl || undefined,
    resultImageUrl: result.resultImageUrl || undefined,
    status: result.status as 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  }));

  const breadcrumbs = [
    {
      label: t('title'),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <OutfitHistoryList results={results} />
          </div>
        </div>
      </div>
    </>
  );
}
