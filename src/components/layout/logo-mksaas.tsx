import { cn } from '@/lib/utils';
import Image from 'next/image';

export function MkSaaSLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Logo of AI Tryon"
      title="Logo of AI Tryon"
      width={96}
      height={96}
      className={cn('size-8 rounded-md', className)}
    />
  );
}
