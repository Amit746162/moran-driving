import Image from 'next/image';

import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

/** Avatar with graceful initials fallback when no image is present. */
export function Avatar({ src, name, size = 40, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={name ?? 'Avatar'} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="text-sm font-semibold">{initials(name)}</span>
      )}
    </span>
  );
}
