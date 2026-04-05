import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';
import { ALL_CIVILIZATION_LABELS } from '@/shared/data/civilizationLabels';
import { EVENT_CIVILIZATION, getCivImageUrl } from '@/shared/data/civilizationAssets';
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

export default function CivilizationIndex() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #14141e 0%, #0c0c12 30%, #08080c 60%, #050508 100%)',
      }}
    >
      <div className="w-full max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          <h1
            className="text-text-primary leading-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 700,
            }}
          >
            Civilizations
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              color: '#55556a',
              marginTop: '4px',
            }}
          >
            Explore the great cultures that shaped human history
          </p>
        </motion.header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_CIVILIZATION_LABELS.map((civ, i) => {
            const firstPack = Object.values(EVENT_CIVILIZATION).find(p => p.slug === civ.slug);
            const thumbUrl = firstPack ? getCivImageUrl(civ.slug, firstPack.thumbnail) : undefined;

            return (
              <motion.div
                key={civ.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.04, ease: EASE }}
              >
                <GlassCard
                  className="group relative overflow-hidden cursor-pointer hover:border-white/[0.14] hover:translate-y-[-2px] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                  onClick={() => navigate(`/civilizations/${civ.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/civilizations/${civ.slug}`)}
                  aria-label={`${civ.name} - ${civ.eventIds.length} events`}
                >
                  <div className="relative h-[120px] overflow-hidden rounded-t-[12px]">
                    {thumbUrl && (
                      <img
                        src={thumbUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to top, rgba(14, 14, 20, 0.95) 0%, rgba(14, 14, 20, 0.3) 60%, transparent 100%)',
                      }}
                    />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3
                        className="text-text-primary group-hover:text-[#c49a44] transition-colors"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: '16px',
                          fontWeight: 600,
                        }}
                      >
                        {civ.name}
                      </h3>
                    </div>
                  </div>

                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-1"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '11px',
                          color: '#55556a',
                        }}
                      >
                        <MapPin size={12} />
                        {civ.lat.toFixed(1)}, {civ.lng.toFixed(1)}
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '11px',
                          color: '#c49a44',
                        }}
                      >
                        {civ.eventIds.length} event{civ.eventIds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="flex-shrink-0 text-text-muted group-hover:text-[#c49a44] group-hover:translate-x-0.5"
                      style={{ transition: 'color 200ms, transform 200ms' }}
                    />
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
