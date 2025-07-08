'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, User } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

interface OutfitResult {
  id: string;
  userId: string;
  personImageUrl: string;
  topGarmentUrl?: string;
  bottomGarmentUrl?: string;
  resultImageUrl?: string;
  taskId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

interface OutfitHistoryCardProps {
  result: OutfitResult;
}

export function OutfitHistoryCard({ result }: OutfitHistoryCardProps) {
  const t = useTranslations('Dashboard.outfitHistory');
  const [isDownloading, setIsDownloading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return t('status.succeeded');
      case 'FAILED':
        return t('status.failed');
      case 'RUNNING':
        return t('status.running');
      case 'PENDING':
        return t('status.pending');
      default:
        return status;
    }
  };

  const handleDownload = async () => {
    if (!result.resultImageUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(result.resultImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `outfit-result-${result.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {t('resultTitle')} #{result.id.slice(-8)}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(result.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              </div>
              <Badge className={getStatusColor(result.status)}>
                {getStatusText(result.status)}
              </Badge>
            </div>
          </div>
          {result.resultImageUrl && (
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isDownloading 
                ? t('downloading')
                : t('download')
              }
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 原人物图 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t('originalPerson')}
            </h4>
            <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
              <Image
                src={result.personImageUrl}
                alt="原人物图"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* 上衣图 */}
          {result.topGarmentUrl && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('topGarment')}
              </h4>
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={result.topGarmentUrl}
                  alt="上衣"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* 下装图 */}
          {result.bottomGarmentUrl && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('bottomGarment')}
              </h4>
              <div className="relative aspect-square rounded-lg overflow-hidden border">
                <Image
                  src={result.bottomGarmentUrl}
                  alt="下装"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* 结果图 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t('result')}
            </h4>
            <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
              {result.resultImageUrl ? (
                <Image
                  src={result.resultImageUrl}
                  alt="换衣结果"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  {result.status === 'SUCCEEDED' 
                    ? t('noResult')
                    : getStatusText(result.status)
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 