import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, ChevronRight } from 'lucide-react';
import { EVENT_CIVILIZATION, getCivImageUrl } from '@/shared/data/civilizationAssets';
import { ALL_CIVILIZATION_LABELS } from '@/shared/data/civilizationLabels';
import { SEED_EVENTS } from '@/shared/utils/constants';
import { formatYear } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[12px] transition-all duration-200', className)}
      style={{
        background: 'rgba(14, 14, 20, 0.6)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default function CivilizationGallery() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const civData = useMemo(() => {
    const label = ALL_CIVILIZATION_LABELS.find(c => c.slug === slug);
    if (!label) return null;

    const firstPack = Object.values(EVENT_CIVILIZATION).find(p => p.slug === slug);
    if (!firstPack) return null;

    const galleryImages = Array.from({ length: 20 }, (_, i) =>
      getCivImageUrl(slug!, i + 1),
    );

    const relatedEvents = label.eventIds
      .map(id => SEED_EVENTS.find(e => e.id === id))
      .filter(Boolean) as typeof SEED_EVENTS;

    return {
      name: label.name,
      slug: label.slug,
      lat: label.lat,
      lng: label.lng,
      totalImages: firstPack.totalImages,
      galleryImages,
      relatedEvents,
    };
  }, [slug]);

  if (!civData) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center lg:pl-[64px]"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #14141e 0%, #0c0c12 30%, #08080c 60%, #050508 100%)',
        }}
      >
        <div className="text-center">
          <p
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', color: '#8a8a9a' }}
          >
            Civilization not found
          </p>
          <button
            onClick={() => navigate('/civilizations')}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.04)]"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              color: '#c49a44',
              border: '1px solid rgba(196, 154, 68, 0.25)',
            }}
          >
            <ArrowLeft size={16} />
            Back to Civilizations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #14141e 0%, #0c0c12 30%, #08080c 60%, #050508 100%)',
      }}
    >
      <div className="w-full max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        >
          <button
            onClick={() => navigate('/civilizations')}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-[10px] cursor-pointer transition-all duration-200 hover:bg-[rgba(255,255,255,0.04)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              color: '#8a8a9a',
            }}
            aria-label="Back to all civilizations"
          >
            <ArrowLeft size={16} />
            All Civilizations
          </button>
        </motion.div>

        <motion.header
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        >
          <h1
            className="text-text-primary leading-tight mb-2"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 700,
            }}
          >
            {civData.name}
          </h1>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                color: '#c49a44',
              }}
            >
              <MapPin size={14} />
              {civData.lat.toFixed(1)}, {civData.lng.toFixed(1)}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                color: '#55556a',
              }}
            >
              {civData.totalImages} illustrations
            </span>
          </div>
        </motion.header>

        <motion.section
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
        >
          <h2
            className="mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              color: '#e0e0e6',
            }}
          >
            Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {civData.galleryImages.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.03, ease: EASE }}
              >
                <div
                  className="group relative aspect-square rounded-[12px] overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
                  style={{
                    background: 'rgba(14, 14, 20, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <img
                    src={url}
                    alt={`${civData.name} illustration ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-opacity duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end"
                    style={{
                      background: 'linear-gradient(to top, rgba(8, 8, 12, 0.8) 0%, transparent 50%)',
                    }}
                  >
                    <span
                      className="px-3 py-2"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '11px',
                        color: '#8a8a9a',
                      }}
                    >
                      #{i + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {civData.relatedEvents.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          >
            <h2
              className="mb-4"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: 600,
                color: '#e0e0e6',
              }}
            >
              Related Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {civData.relatedEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 + i * 0.06, ease: EASE }}
                >
                  <GlassCard
                    className="group cursor-pointer hover:border-white/[0.14] hover:translate-y-[-2px] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                    onClick={() => navigate(`/explore?event=${event.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/explore?event=${event.id}`)}
                    aria-label={`${event.title} - ${formatYear(event.year)}`}
                  >
                    <div className="px-5 py-4 flex items-center gap-4">
                      <div
                        className="flex-shrink-0 w-[44px] h-[44px] rounded-[10px] flex items-center justify-center"
                        style={{
                          background: 'rgba(196, 154, 68, 0.08)',
                          border: '1px solid rgba(196, 154, 68, 0.12)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#c49a44',
                          }}
                        >
                          {formatYear(event.year)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-text-primary group-hover:text-[#c49a44] transition-colors truncate"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        >
                          {event.title}
                        </h3>
                        <p
                          className="truncate"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '12px',
                            color: '#55556a',
                            marginTop: '2px',
                          }}
                        >
                          {event.locationName} · {event.category}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="flex-shrink-0 text-text-muted group-hover:text-[#c49a44] group-hover:translate-x-0.5"
                        style={{ transition: 'color 200ms, transform 200ms' }}
                      />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
