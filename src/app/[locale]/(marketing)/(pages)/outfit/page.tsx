import { OutfitPageHeader } from '@/components/outfit/outfit-page-header';
import Container from '@/components/layout/container';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import { OutfitGrid } from '@/components/outfit/outfit-grid';
import { getOutfits } from '@/data/outfit-data';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'OutfitPage' });

  // 根据语言设置不同的标题格式
  const pageTitle = locale === 'zh' 
    ? `${pt('title')} - ${t('name')}`
    : `${pt('title')} | ${t('name')}`;

  return constructMetadata({
    title: pageTitle,
    description: pt('description'),
    canonicalUrl: getUrlWithLocale('/outfit', locale),
  });
}

export default async function OutfitPage() {
  // 从数据库获取outfit数据
  const outfits = await getOutfits();

  return (
    <Container className="py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <OutfitPageHeader />
        <OutfitGrid outfits={outfits} />
      </div>
    </Container>
  );
} 