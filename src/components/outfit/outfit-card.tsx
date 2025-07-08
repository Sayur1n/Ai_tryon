'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { OutfitCarousel } from './outfit-carousel';
import { useTranslations } from 'next-intl';

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
  split_images: SplitImage[];
  description?: string; // 商品描述
}

interface OutfitCardProps {
  outfit: OutfitData;
}

export function OutfitCard({ outfit }: OutfitCardProps) {
  const [showCarousel, setShowCarousel] = useState(false);
  const t = useTranslations('OutfitPage');

  // 调试信息
  console.log('OutfitCard render:', {
    id: outfit.id,
    description: outfit.description,
    hasDescription: !!outfit.description
  });

  // 获取要显示的主要图片
  const getMainImage = () => {
    if (outfit.url) {
      return outfit.url; // 有模特图时显示模特图
    } else if (outfit.split_images.length > 0) {
      return outfit.split_images[0].url; // 没有模特图时显示第一件衣服
    }
    return null;
  };

  // 获取要显示的侧边图片
  const getSideImages = () => {
    if (outfit.url) {
      return outfit.split_images; // 有模特图时显示所有衣服
    } else {
      return outfit.split_images.slice(1); // 没有模特图时显示除第一件外的其他衣服
    }
  };

  const mainImage = getMainImage();
  const sideImages = getSideImages();
  
  // 计算实际显示的图片数量
  const displayImageCount = (mainImage ? 1 : 0) + sideImages.length;

  // 根据实际显示的图片数量决定布局
  const getLayoutClass = () => {
    if (displayImageCount === 1) {
      return 'flex-col h-72'; // 单图垂直布局，统一高度
    } else if (displayImageCount === 2) {
      // 没有模特图时，上衣下衣上下排列
      if (!outfit.url) {
        return 'flex-col h-72'; // 上下排列，统一高度
      } else {
        return 'flex-row h-72'; // 有模特图时左右排列，统一高度
      }
    } else {
      return 'flex-row h-72'; // 三图主图+右侧布局，统一高度
    }
  };

  const getMainImageClass = () => {
    if (displayImageCount === 1) {
      return 'w-full h-full'; // 单图占满
    } else if (displayImageCount === 2) {
      if (!outfit.url) {
        return 'w-full h-1/2 overflow-hidden'; // 没有模特图时占上半部分，添加overflow-hidden
      } else {
        return 'flex-1'; // 有模特图时平分
      }
    } else {
      return 'flex-1'; // 三图主图占大部分
    }
  };

  const getSideImagesClass = () => {
    if (displayImageCount === 1) {
      return 'hidden'; // 单图不显示侧边
    } else if (displayImageCount === 2) {
      if (!outfit.url) {
        return 'w-full h-1/2 flex items-center justify-center overflow-hidden'; // 没有模特图时占下半部分，添加overflow-hidden
      } else {
        return 'flex-1 flex items-center justify-center'; // 有模特图时平分
      }
    } else {
      return 'w-32 flex flex-col items-center justify-center gap-4'; // 三图右侧窄条
    }
  };

  const getSideImageSize = () => {
    if (displayImageCount === 2) {
      if (!outfit.url) {
        return 'w-full h-full max-h-full'; // 没有模特图时占满下半部分，限制最大高度
      } else {
        return 'w-24 h-24'; // 有模特图时较小
      }
    } else {
      return 'w-20 h-20'; // 三图时较小
    }
  };

  // 计算衣服件数（不包含模特图）
  const clothingCount = outfit.split_images.length;

  return (
    <>
      <Card className="overflow-hidden shadow-md rounded-xl relative group">
        <CardContent className={`p-0 flex ${getLayoutClass()} relative bg-white rounded-xl`}>
          {/* 右上角item数量 - 移到卡片级别 */}
          <span className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded shadow z-10">
            {clothingCount} {clothingCount === 1 ? t('item') : t('items')}
          </span>

          {/* 主图区域 */}
          <div className={`relative ${getMainImageClass()}`}>
            {mainImage ? (
              <Image
                src={mainImage}
                alt={`Outfit ${outfit.id}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`${displayImageCount === 2 && !outfit.url ? 'object-contain' : 'object-cover'} ${displayImageCount === 2 && !outfit.url ? 'rounded-t-xl' : 'rounded-l-xl'}`}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${displayImageCount === 2 && !outfit.url ? 'rounded-t-xl' : 'rounded-l-xl'}`}>
                <div className="text-center text-gray-400">
                  <div className="text-2xl mb-2">👗</div>
                  <div className="text-sm">No Images</div>
                </div>
              </div>
            )}
          </div>

          {/* 侧边图片区域 */}
          {sideImages.length > 0 && (
            <div className={`${getSideImagesClass()} relative bg-white ${displayImageCount === 2 && !outfit.url ? 'rounded-b-xl' : displayImageCount === 2 ? 'rounded-r-xl' : 'border-l'}`}>
              {sideImages.map((img) => (
                <div key={img.id} className={`relative ${getSideImageSize()} ${displayImageCount === 2 && !outfit.url ? 'bg-gray-50' : 'border rounded-md bg-gray-50'} overflow-hidden`}>
                  <Image src={img.url} alt={img.type} fill sizes="(max-width: 640px) 20vw, (max-width: 768px) 15vw, (max-width: 1024px) 10vw, 8vw" className="object-contain" />
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* 底部栏 */}
        <div className="px-4 py-3 border-t bg-white rounded-b-xl">
          {/* 商品描述 - 预留三行空间，确保卡片对齐 */}
          <div className={`text-xs mb-3 p-2 rounded border h-16 overflow-hidden ${
            outfit.description 
              ? 'text-gray-600 bg-gray-50 border-gray-200' 
              : 'text-transparent bg-transparent border-transparent'
          }`}>
            {outfit.description ? (
              <div className="line-clamp-3">
                <strong>描述:</strong> {outfit.description}
              </div>
            ) : (
              <div className="invisible">占位</div>
            )}
          </div>
          
          {/* 查看穿搭按钮 - 居中靠下 */}
          <div className="flex justify-center mb-2">
            <Button
              variant="default"
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
              onClick={() => setShowCarousel(true)}
            >
              {t('viewOutfit', { defaultValue: '查看穿搭' })}
              <span className="ml-1">✨</span>
            </Button>
          </div>
          
          {/* 性别标签 - 左下角 */}
          <div className="flex justify-start">
            <span className="text-sm text-primary font-medium">
              {outfit.sex === 'male' ? t('filters.male') : t('filters.female')}
            </span>
          </div>
        </div>
      </Card>
      
      {showCarousel && (
        <OutfitCarousel
          splitImages={outfit.split_images}
          onClose={() => setShowCarousel(false)}
          outfit={outfit}
        />
      )}
    </>
  );
} 