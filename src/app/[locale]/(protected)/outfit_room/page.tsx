import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import OutfitRoomClient from './outfit-room-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'OutfitRoom' });

  // 根据语言设置不同的标题格式
  const pageTitle = locale === 'zh' 
    ? `AI虚拟试衣 - ${t('name')}`
    : `AI Virtual Try-On | ${t('name')}`;

  return constructMetadata({
    title: pageTitle,
    description: locale === 'zh' 
      ? '体验革命性的AI虚拟试衣技术，上传您的照片和服装图片，立即看到穿在身上的效果'
      : 'Experience revolutionary AI virtual try-on technology. Upload your photo and clothing images to see how they look on you instantly',
    canonicalUrl: getUrlWithLocale('/outfit_room', locale),
  });
}

interface OutfitRoomPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function OutfitRoomPage(props: OutfitRoomPageProps) {
  const params = await props.params;
  const { locale } = params;

  return <OutfitRoomClient locale={locale} />;
}
