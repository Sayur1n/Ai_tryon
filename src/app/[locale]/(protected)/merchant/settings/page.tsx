import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export default function MerchantSettingsPage() {
  const t = useTranslations('Merchant');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('sidebar.settings')}</h1>
        <p className="text-muted-foreground">管理商家账户设置</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              商家管理功能已实现，包括：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>用户管理 - 查看和管理所有用户</li>
              <li>服装管理 - 上传和管理服装卡片数据</li>
              <li>模特管理 - 上传和管理默认模特数据</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>功能说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">服装管理</h4>
                <p className="text-sm text-muted-foreground">
                  可以上传模特图片、上衣图片、下衣图片，设置商品描述和购买链接。
                  这些数据将显示在 @/outfit 页面的卡片中。
                </p>
              </div>
              <div>
                <h4 className="font-medium">模特管理</h4>
                <p className="text-sm text-muted-foreground">
                  可以上传默认模特数据，包括模特图片、基本信息等。
                  这些模特将作为 @/outfit_room 页面的默认模特供用户选择。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 