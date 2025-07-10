import { MkSaaSLogo } from '@/components/layout/logo-mksaas';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BuiltWithButton() {
  return (
    <Link
      target="_blank"
      href="https://github.com/Sayur1n/Ai_tryon"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'border border-border px-4 rounded-md'
      )}
    >
      <span>Built with</span>
      <span>
        <MkSaaSLogo className="size-5 rounded-full" />
      </span>
      <span className="font-semibold">AI Tryon</span>
    </Link>
  );
}
