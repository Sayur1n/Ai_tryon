import { redirect } from 'next/navigation';
import { getSession } from '@/lib/server';

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  // 检查用户是否为商家或管理员
  if (session.user.role !== 'merchant' && session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  );
} 