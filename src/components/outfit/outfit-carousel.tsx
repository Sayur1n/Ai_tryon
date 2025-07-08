'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface SplitImage {
  id: string;
  url: string;
  type: string;
  amazon_url: string;
}

interface OutfitData {
  id: string;
  url?: string; // 模特图可选
  type: string;
  sex: string;
  description?: string; // 商品描述
  split_images: SplitImage[];
}

interface OutfitCarouselProps {
  splitImages: SplitImage[];
  onClose: () => void;
  outfit: OutfitData;
}

export function OutfitCarousel({ splitImages, onClose, outfit }: OutfitCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = useTranslations('OutfitPage');
  const [tab, setTab] = useState(splitImages[0]?.type || 'top');
  const router = useRouter();

  const filteredIndex = splitImages.findIndex(img => img.type === tab);
  const showIndex = filteredIndex !== -1 ? filteredIndex : 0;

  const handleTryOn = () => {
    // 准备跳转到outfit_room页面的参数
    const params = new URLSearchParams();
    
    // 根据衣服类型设置参数
    const topImages = splitImages.filter(img => img.type === 'top');
    const bottomImages = splitImages.filter(img => img.type === 'bottom');
    
    if (topImages.length > 0) {
      params.set('topImage', topImages[0].url);
    }
    if (bottomImages.length > 0) {
      params.set('bottomImage', bottomImages[0].url);
    }
    
    // 设置服装类型
    if (topImages.length > 0 && bottomImages.length > 0) {
      params.set('clothType', 'topbottom');
    } else {
      params.set('clothType', 'onesuit');
    }
    
    // 设置性别
    params.set('sex', outfit.sex);
    
    // 跳转到outfit_room页面
    router.push(`/outfit_room?${params.toString()}`);
    onClose(); // 关闭弹窗
  };

  const handleBuyNow = () => {
    window.open(splitImages[showIndex].amazon_url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[95vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">{t('outfitDetails', { defaultValue: 'Outfit Details' })}</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-primary text-white text-xs font-semibold">
                {outfit.sex === 'male' ? t('filters.male') : t('filters.female')}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* 主图轮播 */}
          <div className="flex flex-col items-center p-6">
            <div className="relative w-56 h-56 mx-auto mb-2">
              <Image
                src={splitImages[showIndex].url}
                alt={splitImages[showIndex].type}
                fill
                sizes="224px"
                className="object-contain rounded-lg border"
              />
              {/* 左右箭头 */}
              {splitImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setTab(splitImages[(showIndex - 1 + splitImages.length) % splitImages.length].type)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => setTab(splitImages[(showIndex + 1) % splitImages.length].type)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
            {/* 商品类型tab */}
            <div className="flex gap-2 mb-2">
              {splitImages.map((img) => (
                <Button
                  key={img.id}
                  variant={tab === img.type ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => setTab(img.type)}
                >
                  {img.type === 'top' ? t('carousel.top') : t('carousel.bottom')}
                </Button>
              ))}
            </div>
            {/* 描述 */}
            <div className="text-center mb-4">
              <div className="font-semibold text-lg">
                {splitImages[showIndex].type === 'top' ? t('carousel.top') : t('carousel.bottom')}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('outfitDesc', { defaultValue: 'Experience the future of fashion with our AI virtual try-on platform' })}
              </div>
            </div>
            {/* 按钮 */}
            <div className="flex gap-2 w-full mb-2">
              <Button onClick={handleBuyNow} className="flex-1 bg-gradient-to-r from-primary to-purple-500 text-white font-bold shadow">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('card.buyNow')}
              </Button>
              <Button onClick={handleTryOn} variant="outline" className="flex-1 font-bold">
                {t('card.tryOn')}
              </Button>
            </div>
            {/* Outfit Items Tab */}
            <div className="flex gap-2 mt-2">
              {splitImages.map((img, idx) => (
                <div
                  key={img.id}
                  className={`flex flex-col items-center px-2 py-1 rounded cursor-pointer border ${tab === img.type ? 'border-primary bg-primary/10' : 'border-transparent'}`}
                  onClick={() => setTab(img.type)}
                >
                  <div className="w-8 h-8 relative mb-1">
                    <Image src={img.url} alt={img.type} fill sizes="32px" className="object-contain rounded" />
                  </div>
                  <span className={`text-xs ${tab === img.type ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                    {img.type === 'top' ? t('carousel.top') : t('carousel.bottom')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 