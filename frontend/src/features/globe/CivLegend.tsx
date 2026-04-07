import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Map, ChevronRight, Loader2 } from 'lucide-react';
import { useTimeStore } from '@/shared/stores/timeStore';
import { getVisibleCivilizationLabels } from '@/shared/data/civilizationLabels';
import { useSpotlightStore } from '@/shared/stores/spotlightStore';
import { findCivIdByName } from '@/shared/data/civAliases';
import { preloadAllGeoJson, isPreloaded } from '@/shared/data/geoJsonCache';

// Must match the color logic in GlobeView.tsx
const MAJOR_CIV_COLORS: Record<string, string> = {
  'Rome': '#b85454', 'Roman Empire': '#b85454',
  'Achaemenid Empire': '#c49a44', 'Greek city-states': '#5a8fa5',
  'Carthaginian Empire': '#b87a60', 'Zhou states': '#6d9476',
  'Magadha': '#8b80b0', 'Olmec': '#7a9e5a', 'Meroe': '#c4944a',
  'Hindu kingdoms': '#d4a054', 'Mauryan Empire': '#8b80b0',
  'Han Empire': '#6d9476', 'Mongol Empire': '#b85454',
  'Ottoman Empire': '#c49a44', 'Byzantine Empire': '#8b6faa',
  'Tang Dynasty': '#5a9aaa', 'Song Dynasty': '#5a9aaa',
  'Ming Dynasty': '#5a9aaa', 'Qing Dynasty': '#5a9aaa',
  'Abbasid Caliphate': '#c49a44', 'Umayyad Caliphate': '#d4a054',
  'Mali Empire': '#c4944a', 'Songhai Empire': '#b87a60',
  'Inca Empire': '#7a9e5a', 'Aztec Empire': '#b87a60',
  'Mughal Empire': '#d4a054', 'British Empire': '#b85454',
  'Spanish Empire': '#c49a44', 'French Empire': '#5a7fb5',
  'Russian Empire': '#8b6faa',
};

const CIV_PALETTE = [
  '#c49a44', '#b85454', '#5a8fa5', '#6d9476', '#8b80b0',
  '#b87a60', '#7a9e5a', '#5a7fb5', '#d4a054', '#8b6faa',
  '#c4944a', '#5a9aaa', '#9a7b5a', '#7b8fa5', '#a08070',
  '#6b8b7a', '#9b7090', '#8a9b6a', '#7a6b8b', '#ab8060',
];

function getCivColor(name: string): string {
  if (MAJOR_CIV_COLORS[name]) return MAJOR_CIV_COLORS[name]!;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return CIV_PALETTE[Math.abs(hash) % CIV_PALETTE.length]!;
}

export function CivLegend() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentYear = useTimeStore(s => s.currentYear);
  const spotlightActive = useSpotlightStore(s => s.active);
  const enterSpotlight = useSpotlightStore(s => s.enterSpotlight);

  const labels = useMemo(() => getVisibleCivilizationLabels(currentYear), [currentYear]);

  // Preload GeoJSON when legend opens
  const handleOpen = useCallback(async () => {
    setOpen(o => !o);
    if (!isPreloaded()) {
      setLoading(true);
      await preloadAllGeoJson();
      setLoading(false);
    }
  }, []);

  // Click a civilization to enter spotlight mode
  const handleCivClick = useCallback(async (civName: string) => {
    const civId = findCivIdByName(civName);
    if (!civId) return;
    if (!isPreloaded()) {
      setLoading(true);
      await preloadAllGeoJson();
      setLoading(false);
    }
    enterSpotlight(civId);
    setOpen(false);
  }, [enterSpotlight]);

  if (labels.length === 0 || spotlightActive) return null;

  return (
    <div className="fixed bottom-[180px] lg:bottom-[190px] right-4 lg:right-5 z-30">
      {/* Toggle button */}
      <motion.button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
        style={{
          background: 'rgba(10, 10, 16, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}
        whileHover={{ borderColor: 'rgba(196, 154, 68, 0.3)' }}
        whileTap={{ scale: 0.97 }}
      >
        <Map size={13} className="text-[#c49a44]" />
        <span className="text-[11px] font-semibold text-[#8a8a9a] tracking-wide uppercase">
          Civilizations
        </span>
        <span className="text-[10px] text-[#3a3a4a] font-mono">{labels.length}</span>
        {open ? <ChevronDown size={12} className="text-[#55556a]" /> : <ChevronUp size={12} className="text-[#55556a]" />}
      </motion.button>

      {/* Legend panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full right-0 mb-2 w-[220px] max-h-[320px] overflow-y-auto rounded-xl"
            style={{
              background: 'rgba(10, 10, 16, 0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-3 space-y-1">
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={14} className="text-[#c49a44] animate-spin" />
                  <span className="text-[10px] text-[#55556a] ml-2">Loading territories...</span>
                </div>
              )}
              {labels.map((civ: any) => {
                const color = getCivColor(civ.name);
                const hasCivId = !!findCivIdByName(civ.name);
                return (
                  <button
                    key={civ.slug}
                    onClick={() => hasCivId && handleCivClick(civ.name)}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors w-full text-left ${hasCivId ? 'cursor-pointer hover:bg-white/[0.06]' : 'cursor-default opacity-60'}`}
                  >
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
                    />
                    <span className="text-[11px] font-medium text-[#8a8a9a] truncate flex-1">
                      {civ.name}
                    </span>
                    {hasCivId && <ChevronRight size={10} className="text-[#3a3a4a] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
