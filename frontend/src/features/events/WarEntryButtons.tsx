import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Swords, ArrowRight } from 'lucide-react';
import { useWarStore } from '@/shared/stores/warStore';
import { useUIStore } from '@/shared/stores/uiStore';

const ACCENT = '#d4a574';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface WarCardProps {
  war: 'wwi' | 'wwii';
  title: string;
  span: string;
  blurb: string;
}

function WarCard({ war, title, span, blurb }: WarCardProps) {
  const enterWar = useWarStore((s) => s.enterWar);
  const navigate = useNavigate();
  const isMobile = useUIStore((s) => s.isMobile);

  const onClick = () => {
    if (isMobile) return; // desktop-only for v1
    enterWar(war);
    navigate('/explore');
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={isMobile}
      className="group relative flex flex-col text-left rounded-2xl overflow-hidden cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${ACCENT}30`,
        padding: '24px',
        minHeight: '180px',
      }}
      whileHover={isMobile ? {} : {
        scale: 1.02,
        borderColor: `${ACCENT}70`,
        boxShadow: `0 0 40px ${ACCENT}25, 0 12px 40px var(--glass-shadow)`,
      }}
      whileTap={isMobile ? {} : { scale: 0.98 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(to right, transparent, ${ACCENT}, transparent)` }}
      />

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}35` }}
        >
          <Swords size={20} style={{ color: ACCENT }} />
        </div>
        <div>
          <h3
            className="text-[16px] font-bold leading-tight"
            style={{
              color: ACCENT,
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.04em',
            }}
          >
            {title}
          </h3>
          <p className="text-[11px] font-mono text-text-muted">{span}</p>
        </div>
      </div>

      <p className="text-[12px] text-text-secondary leading-[1.6] flex-1">{blurb}</p>

      <div className="flex items-center justify-between mt-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {isMobile ? 'Desktop only' : 'Enter War Mode'}
        </span>
        {!isMobile && (
          <ArrowRight
            size={16}
            style={{ color: ACCENT }}
            className="transition-transform group-hover:translate-x-1"
          />
        )}
      </div>
    </motion.button>
  );
}

export function WarEntryButtons() {
  return (
    <section className="mb-12">
      <h2
        className="text-[14px] font-bold uppercase mb-1"
        style={{
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.12em',
        }}
      >
        Focused Experiences
      </h2>
      <p className="text-[12px] text-text-muted mb-5">
        Cinematic walks through pivotal moments. Watch borders shift year by year.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WarCard
          war="wwi"
          title="WORLD WAR I"
          span="1914 — 1918"
          blurb="From the spark in Sarajevo to the Armistice. Four years of trench warfare that redrew the map of Europe and ended four empires."
        />
        <WarCard
          war="wwii"
          title="WORLD WAR II"
          span="1939 — 1945"
          blurb="From the Anschluss to V-E Day. The largest conflict in human history — borders shifted year by year as the Axis advanced and the Allies pushed back."
        />
      </div>
    </section>
  );
}
