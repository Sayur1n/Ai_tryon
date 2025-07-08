'use client';
import { useTranslations } from 'next-intl';

export function OutfitPageHeader() {
  const t = useTranslations('OutfitPage');
  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold text-foreground">
        {t('title')}
      </h1>
      <p className="text-xl text-muted-foreground">
        {t('subtitle')}
      </p>
      <p className="text-base text-muted-foreground max-w-2xl mx-auto">
        {t('description')}
      </p>
    </div>
  );
} 