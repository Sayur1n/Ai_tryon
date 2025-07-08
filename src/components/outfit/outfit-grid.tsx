'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { OutfitCard } from './outfit-card';
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
  description?: string; // 商品描述
  split_images: SplitImage[];
}

interface OutfitGridProps {
  outfits: OutfitData[];
}

type FilterType = 'all' | 'male' | 'female';

export function OutfitGrid({ outfits }: OutfitGridProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const t = useTranslations('OutfitPage');

  const filteredOutfits = useMemo(() => {
    if (filter === 'all') return outfits;
    return outfits.filter(outfit => outfit.sex === filter);
  }, [outfits, filter]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-end space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          {t('filters.all')}
        </Button>
        <Button
          variant={filter === 'male' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('male')}
        >
          {t('filters.male')}
        </Button>
        <Button
          variant={filter === 'female' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('female')}
        >
          {t('filters.female')}
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {t('filters.all')}: {outfits.length} | {t('filters.male')}: {outfits.filter(o => o.sex === 'male').length} | {t('filters.female')}: {outfits.filter(o => o.sex === 'female').length}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredOutfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>

      {/* Empty State */}
      {filteredOutfits.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t('emptyState')}
          </p>
        </div>
      )}
    </div>
  );
} 