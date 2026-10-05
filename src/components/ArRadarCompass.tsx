import React from 'react';
import { Artwork } from '../data/jaxData';

interface ArRadarCompassProps {
  currentHeading: number;
  artworks: Artwork[];
  activeArtworkId: string;
  onSelectArtwork: (artwork: Artwork) => void;
  isArabic: boolean;
}

export const ArRadarCompass: React.FC<ArRadarCompassProps> = ({
  currentHeading,
  artworks,
  activeArtworkId,
  onSelectArtwork,
  isArabic
}) => {
  const getCardinal = (deg: number) => {
    const d = (deg + 360) % 360;
    if (d >= 338 || d < 23) return isArabic ? 'شمال N' : 'N 0°';
    if (d >= 23 && d < 68) return isArabic ? 'شمال شرق NE' : 'NE 45°';
    if (d >= 68 && d < 113) return isArabic ? 'شرق E' : 'E 90°';
    if (d >= 113 && d < 158) return isArabic ? 'جنوب شرق SE' : 'SE 135°';
    if (d >= 158 && d < 203) return isArabic ? 'جنوب S' : 'S 180°';
    if (d >= 203 && d < 248) return isArabic ? 'جنوب غرب SW' : 'SW 225°';
    if (d >= 248 && d < 293) return isArabic ? 'غرب W' : 'W 270°';
    return isArabic ? 'شمال غرب NW' : 'NW 315°';
  };

  return (
    <div className="flex flex-col items-center gap-2 pointer-events-auto">
      {/* Top Precision Compass Ribbon */}
      <div className="relative w-64 h-8 bg-[#0a0d14]/80 backdrop-blur-xl rounded-xl border border-cyan-500/20 overflow-hidden flex items-center justify-center shadow-2xl">
        {/* Needle indicator in cyan */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-cyan-400 z-10 shadow-[0_0_8px_#00F0FF]" />

        {/* Degree markers ribbon */}
        <div
          className="absolute flex items-center h-full transition-transform duration-200 ease-out font-mono text-[10px]"
          style={{
            transform: `translateX(${-((currentHeading % 360) * 2.8)}px)`
          }}
        >
          {Array.from({ length: 72 }).map((_, i) => {
            const deg = i * 10;
            const isMajor = deg % 30 === 0;
            return (
              <div
                key={i}
                className="flex flex-col items-center justify-end h-full px-2"
                style={{ width: '28px' }}
              >
                {isMajor && (
                  <span className="text-stone-300 text-[9px] mb-1 font-semibold">
                    {deg}°
                  </span>
                )}
                <div
                  className={`w-px ${
                    isMajor ? 'h-3 bg-cyan-400' : 'h-1.5 bg-stone-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Cardinal tag */}
        <div className="absolute bottom-0.5 right-2 text-[9px] font-bold text-cyan-300 bg-black/60 px-1.5 rounded border border-cyan-500/20">
          {getCardinal(currentHeading)}
        </div>
      </div>

      {/* Mini Radar Dish in Obsidian & Cyan */}
      <div className="relative w-16 h-16 rounded-full bg-[#080b12]/90 backdrop-blur-xl border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute inset-1.5 rounded-full border border-cyan-500/10" />
        <div className="absolute inset-3.5 rounded-full border border-cyan-500/10" />

        {/* Radar Heading Cone */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-400/10 to-cyan-400/25 origin-center transition-transform duration-200"
          style={{ transform: `rotate(${currentHeading}deg)` }}
        />

        {/* Center user dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30 shadow-[0_0_6px_#00F0FF]" />

        {/* Artwork Blips */}
        {artworks.map((art) => {
          const relAngle = ((art.compassBearingDeg - currentHeading + 360) % 360) * (Math.PI / 180);
          const distRatio = Math.min(0.85, Math.max(0.3, art.initialDistanceMeters / 100));
          const radius = 28 * distRatio;
          const x = 32 + Math.sin(relAngle) * radius;
          const y = 32 - Math.cos(relAngle) * radius;
          const isActive = art.id === activeArtworkId;

          return (
            <button
              key={art.id}
              onClick={() => onSelectArtwork(art)}
              title={isArabic ? art.titleAr : art.titleEn}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform ${
                isActive
                  ? 'w-2.5 h-2.5 bg-cyan-300 ring-2 ring-cyan-400 shadow-[0_0_8px_#00F0FF] animate-pulse'
                  : 'w-1.5 h-1.5 bg-stone-400 hover:scale-150'
              }`}
              style={{ left: `${x}px`, top: `${y}px` }}
            />
          );
        })}
      </div>
    </div>
  );
};
