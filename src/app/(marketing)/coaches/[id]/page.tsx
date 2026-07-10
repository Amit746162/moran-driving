import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  Award,
  Briefcase,
  Globe,
  Languages,
  MapPin,
  Video,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getCoachById } from '@/features/coaches/queries';
import { getFavoriteIds } from '@/features/favorites/queries';
import { CoachGallery } from '@/features/coaches/components/coach-gallery';
import { CoachReviews } from '@/features/coaches/components/coach-reviews';
import { RatingStars } from '@/features/coaches/components/rating-stars';
import { FavoriteButton } from '@/features/favorites/components/favorite-button';
import { BookingPanel } from '@/features/bookings/components/booking-panel';
import { getCoachSlots } from '@/features/availability/queries';
import { groupSlotsByDay } from '@/features/availability/lib/generate-slots';

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const coach = await getCoachById(id);
  if (!coach) return { title: 'Coach not found' };
  return {
    title: coach.profile?.full_name ?? 'Coach',
    description: coach.headline ?? undefined,
  };
}

export default async function CoachProfilePage({ params }: { params: Params }) {
  const { id } = await params;
  const [coach, favorites] = await Promise.all([getCoachById(id), getFavoriteIds()]);
  if (!coach) notFound();

  const slotsByDay = groupSlotsByDay(await getCoachSlots(coach.id));

  const name = coach.profile?.full_name ?? 'Coach';
  const location = [coach.city, coach.region, coach.country].filter(Boolean).join(', ');
  const images =
    coach.gallery.length > 0
      ? coach.gallery
      : coach.cover_image_url
        ? [coach.cover_image_url]
        : [];

  return (
    <div className="container py-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Main */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar src={coach.profile?.avatar_url} name={name} size={72} />
            <div className="flex-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
              {coach.headline && (
                <p className="mt-1 text-muted-foreground">{coach.headline}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <RatingStars rating={coach.rating_avg} count={coach.rating_count} />
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {coach.years_experience} yrs
                  experience
                </span>
              </div>
            </div>
            <FavoriteButton coachId={coach.id} initial={favorites.has(coach.id)} />
          </div>

          {images.length > 0 && <CoachGallery images={images} name={name} />}

          {/* Sports & mode */}
          <div className="flex flex-wrap gap-2">
            {coach.sports.map((s) => (
              <Badge key={s.id} variant="primary">
                {s.icon} {s.name}
              </Badge>
            ))}
            {(coach.mode === 'online' || coach.mode === 'both') && (
              <Badge variant="outline">
                <Video className="h-3 w-3" /> Online
              </Badge>
            )}
            {(coach.mode === 'in_person' || coach.mode === 'both') && (
              <Badge variant="outline">
                <MapPin className="h-3 w-3" /> In person
              </Badge>
            )}
          </div>

          {/* Bio */}
          {coach.bio && (
            <Section title="About">
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {coach.bio}
              </p>
            </Section>
          )}

          {/* Details grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {coach.certifications.length > 0 && (
              <InfoCard icon={Award} title="Certifications">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {coach.certifications.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </InfoCard>
            )}
            {coach.languages.length > 0 && (
              <InfoCard icon={Languages} title="Languages">
                <p className="text-sm text-muted-foreground">
                  {coach.languages.join(', ')}
                </p>
              </InfoCard>
            )}
            {coach.training_locations.length > 0 && (
              <InfoCard icon={Globe} title="Training locations">
                <p className="text-sm text-muted-foreground">
                  {coach.training_locations.join(', ')}
                </p>
              </InfoCard>
            )}
          </div>

          {/* Videos */}
          {coach.videos.length > 0 && (
            <Section title="Videos">
              <div className="grid gap-4 sm:grid-cols-2">
                {coach.videos.map((url) => (
                  <div
                    key={url}
                    className="aspect-video overflow-hidden rounded-xl border border-border bg-black"
                  >
                    <video src={url} controls className="h-full w-full" />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Reviews */}
          <Section title={`Reviews (${coach.rating_count})`}>
            <CoachReviews reviews={coach.reviews} />
          </Section>
        </div>

        {/* Booking sidebar */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <BookingPanel
            coachId={coach.id}
            price={coach.price_per_session}
            currency={coach.currency}
            mode={coach.mode}
            sports={coach.sports}
            slotsByDay={slotsByDay}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Award;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </div>
  );
}
