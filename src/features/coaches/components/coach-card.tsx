import Image from 'next/image';
import Link from 'next/link';

import { MapPin, Globe, Video } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

import { type CoachListItem } from '../types';
import { RatingStars } from './rating-stars';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';

/** Marketplace coach card — Airbnb/ClassPass style, fully responsive. */
export function CoachCard({
  coach,
  isFavorite = false,
  showFavorite = true,
}: {
  coach: CoachListItem;
  isFavorite?: boolean;
  showFavorite?: boolean;
}) {
  const name = coach.profile?.full_name ?? 'Coach';
  const location = [coach.city, coach.country].filter(Boolean).join(', ');

  return (
    <Link
      href={ROUTES.coach(coach.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {coach.cover_image_url ? (
          <Image
            src={coach.cover_image_url}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20" />
        )}

        {showFavorite && (
          <div className="absolute right-3 top-3">
            <FavoriteButton coachId={coach.id} initial={isFavorite} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-1.5">
          {(coach.mode === 'online' || coach.mode === 'both') && (
            <Badge variant="primary" className="bg-background/90 backdrop-blur">
              <Video className="h-3 w-3" /> Online
            </Badge>
          )}
          {(coach.mode === 'in_person' || coach.mode === 'both') && (
            <Badge variant="default" className="bg-background/90 backdrop-blur">
              <MapPin className="h-3 w-3" /> In person
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <Avatar src={coach.profile?.avatar_url} name={name} size={40} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold group-hover:text-primary">{name}</h3>
            {coach.headline && (
              <p className="truncate text-sm text-muted-foreground">{coach.headline}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {coach.sports.slice(0, 3).map((s) => (
            <Badge key={s.id} variant="outline">
              {s.icon} {s.name}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <div className="flex flex-col gap-1">
            <RatingStars rating={coach.rating_avg} count={coach.rating_count} />
            {location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" /> {location}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {formatPrice(coach.price_per_session, coach.currency)}
            </p>
            <p className="text-xs text-muted-foreground">/ session</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
