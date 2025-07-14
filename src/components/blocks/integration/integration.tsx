import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRight, Brain, Database, Cloud, Shield, Zap, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type * as React from 'react';

export default function IntegrationSection() {
  const t = useTranslations('HomePage.integration');

  return (
    <section id="integration" className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
          subtitleAs="h2"
          descriptionAs="p"
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <IntegrationCard
            title={t('items.item-1.title')}
            description={t('items.item-1.description')}
          >
            <Brain className="size-10 text-blue-600" />
          </IntegrationCard>

          <IntegrationCard
            title={t('items.item-2.title')}
            description={t('items.item-2.description')}
          >
            <Database className="size-10 text-green-600" />
          </IntegrationCard>

          <IntegrationCard
            title={t('items.item-3.title')}
            description={t('items.item-3.description')}
          >
            <Cloud className="size-10 text-purple-600" />
          </IntegrationCard>

          <IntegrationCard
            title={t('items.item-4.title')}
            description={t('items.item-4.description')}
          >
            <Shield className="size-10 text-red-600" />
          </IntegrationCard>

          <IntegrationCard
            title={t('items.item-5.title')}
            description={t('items.item-5.description')}
          >
            <Zap className="size-10 text-yellow-600" />
          </IntegrationCard>

          <IntegrationCard
            title={t('items.item-6.title')}
            description={t('items.item-6.description')}
          >
            <Globe className="size-10 text-indigo-600" />
          </IntegrationCard>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  title,
  description,
  children,
  link = '#',
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  link?: string;
}) => {
  const t = useTranslations('HomePage.integration');

  return (
    <Card className="p-6 hover:bg-accent dark:hover:bg-accent transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        <div className="flex items-center justify-center mb-4">{children}</div>

        <div className="space-y-2 py-4">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {description}
          </p>
        </div>

        <div className="flex gap-3 border-t border-dashed pt-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1 pr-2 shadow-none"
          >
            <LocaleLink href={link}>
              {t('learnMore')}
              <ChevronRight className="ml-0 !size-3.5 opacity-50" />
            </LocaleLink>
          </Button>
        </div>
      </div>
    </Card>
  );
};
