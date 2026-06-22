import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackColor?: string;
}

/**
 * Image with graceful fallback — shows a styled placeholder
 * if the image fails to load (404, rate limited, etc.)
 */
export function SafeImage({ src, alt, className = '', style, fallbackColor = '#c49a44' }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          ...style,
          background: `linear-gradient(135deg, ${fallbackColor}08, ${fallbackColor}04)`,
        }}
      >
        <div className="flex flex-col items-center gap-2 opacity-30">
          <ImageIcon size={24} />
          <span className="text-[10px] text-text-muted">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
