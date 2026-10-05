import React, { useEffect } from 'react';
import { Radio, Eye, X, MapPin, Sparkles } from 'lucide-react';
import { Artwork } from '../data/jaxData';

interface NearbyArtToastProps {
  artwork: Artwork;
  distanceMeters: number;
  onExplore: (artwork: Artwork) => void;
  onDismiss: () => void;
  isArabic: boolean;
}

export const NearbyArtToast: React.FC<NearbyArtToastProps> = ({
  artwork,
  distanceMeters,
  onExplore,
  onDismiss,
  isArabic
}) => {
  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [artwork.id, onDismiss]);

  return (
    <div className="fixed top-16 md:top-20 inset-x-4 max-w-md mx-auto z-50 pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="bg-[#0a0e18]/95 backdrop-blur-2xl border border-cyan-400/80 rounded-2xl p-3.5 shadow-[0_0_25px_rgba(0,240,255,0.25)] flex items-center justify-between gap-3 text-stone-100">
        {/* Artwork Thumbnail & Proximity Indicator */}
        <div className="relative shrink-0">
          <img
            src={artwork.image}
            alt={artwork.titleAr}
            className="w-14 h-14 rounded-xl object-cover border border-white/10"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_8px_#00F0FF] animate-pulse">
            <Radio className="w-2.5 h-2.5 text-stone-950" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-bold mb-0.5">
            <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>
              {isArabic
                ? `معلم قريب (${distanceMeters}م فقط!)`
                : `Nearby Artwork (${distanceMeters}m away!)`}
            </span>
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
            <span className="font-mono text-stone-400">{artwork.hangarCode}</span>
          </div>

          <h4 className="text-xs font-bold text-white truncate leading-snug">
            {isArabic ? artwork.titleAr : artwork.titleEn}
          </h4>

          <p className="text-[11px] text-stone-400 truncate">
            {isArabic ? artwork.artistAr : artwork.artistEn}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onExplore(artwork)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/20 active:scale-95"
            title={isArabic ? 'فتح في عدسة الواقع المعزز' : 'Open in AR Viewport'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isArabic ? 'استكشاف' : 'Explore'}</span>
          </button>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
            title={isArabic ? 'إغلاق' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
