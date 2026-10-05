import React, { useState } from 'react';
import { X, Compass, Eye, Navigation, Clock, MapPin, Check } from 'lucide-react';
import { HangarLocation, Artwork } from '../data/jaxData';

interface DistrictMasterMapProps {
  hangars: HangarLocation[];
  artworks: Artwork[];
  selectedArtworkId: string;
  onSelectArtwork: (art: Artwork) => void;
  isArabic: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const DistrictMasterMap: React.FC<DistrictMasterMapProps> = ({
  hangars,
  artworks,
  onSelectArtwork,
  isArabic,
  onClose,
  isEmbedded = false
}) => {
  const [activeHangar, setActiveHangar] = useState<HangarLocation>(hangars[0]);

  const content = (
    <div className={`bg-[#0b0e17] border border-cyan-500/30 rounded-2xl w-full text-stone-100 flex flex-col ${isEmbedded ? 'h-full p-4' : 'max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-black text-white">
            {isArabic ? 'مخطط حي جاكس للفنون · الدرعية' : 'JAX Arts District Master Plan'}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            {isArabic ? 'خريطة الهناجر الميدانية ومسارات المشي الحقيقية' : 'Interactive Architectural Pavilion Blueprint'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Blueprint SVG Canvas */}
      <div className="relative w-full h-64 md:h-72 my-3 rounded-xl bg-[#06080e] border border-cyan-500/20 overflow-hidden shadow-inner flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 1000 600">
          {/* Wadi Hanifa corridor */}
          <path
            d="M0,0 Q120,200 60,400 T100,600 L0,600 Z"
            fill="rgba(14, 116, 144, 0.2)"
            stroke="rgba(6, 182, 212, 0.4)"
            strokeWidth="1.5"
          />
          <text x="30" y="320" fill="#22D3EE" fontSize="13" fontWeight="bold" opacity="0.6">
            {isArabic ? 'وادي حنيفة التاريخي' : 'Wadi Hanifa'}
          </text>

          {/* Central Pedestrian Art Boulevard */}
          <line
            x1="250"
            y1="40"
            x2="780"
            y2="550"
            stroke="#1e2433"
            strokeWidth="44"
            strokeLinecap="round"
          />
          <line
            x1="250"
            y1="40"
            x2="780"
            y2="550"
            stroke="#00F0FF"
            strokeWidth="1.5"
            strokeDasharray="8 8"
            opacity="0.4"
          />

          {/* Cross walkways */}
          <line x1="220" y1="200" x2="520" y2="120" stroke="#151924" strokeWidth="16" />
          <line x1="450" y1="420" x2="850" y2="300" stroke="#151924" strokeWidth="16" />

          {/* Hangars */}
          {hangars.map((h) => {
            const cx = h.mapX * 10;
            const cy = h.mapY * 6;
            const isSelected = h.id === activeHangar.id;

            return (
              <g
                key={h.id}
                onClick={() => setActiveHangar(h)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <rect
                  x={cx - 45}
                  y={cy - 30}
                  width="90"
                  height="60"
                  rx="8"
                  fill={isSelected ? 'rgba(0, 240, 255, 0.25)' : '#10141f'}
                  stroke={isSelected ? '#00F0FF' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                />
                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  fill={isSelected ? '#E0F2FE' : '#ffffff'}
                  fontSize="13"
                  fontWeight="bold"
                >
                  {h.code}
                </text>
                <text
                  x={cx}
                  y={cy + 16}
                  textAnchor="middle"
                  fill={isSelected ? '#00F0FF' : '#94a3b8'}
                  fontSize="9"
                >
                  {h.distanceMeters}m
                </text>
              </g>
            );
          })}

          {/* Current Visitor Location Radar Ping */}
          <circle cx="340" cy="270" r="18" fill="rgba(0, 240, 255, 0.2)" className="animate-ping" />
          <circle cx="340" cy="270" r="6" fill="#00F0FF" stroke="#ffffff" strokeWidth="2" />
          <text x="360" y="275" fill="#00F0FF" fontSize="11" fontWeight="bold">
            {isArabic ? 'أنت هنا' : 'You are here'}
          </text>
        </svg>

        {/* Compass Tag */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 border border-cyan-500/20 text-[10px] text-cyan-300">
          <Compass className="w-3.5 h-3.5" />
          <span>N 35° NE</span>
        </div>
      </div>

      {/* Selected Hangar Info Card with Real Photo */}
      <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={activeHangar.image}
            alt={activeHangar.nameAr}
            className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded text-xs border border-cyan-500/30">
                {activeHangar.code}
              </span>
              <h4 className="font-bold text-white text-sm">
                {isArabic ? activeHangar.nameAr : activeHangar.nameEn}
              </h4>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              {isArabic ? activeHangar.roleAr : activeHangar.roleEn}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
              <span className="flex items-center gap-1 text-cyan-400 font-mono">
                <Navigation className="w-3 h-3" />
                {activeHangar.distanceMeters}m
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                {activeHangar.openHours}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const art = artworks.find((a) => a.id === activeHangar.featuredArtworkId);
            if (art) onSelectArtwork(art);
            if (onClose) onClose();
          }}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 text-xs font-bold transition shadow-lg shadow-cyan-400/20 shrink-0"
        >
          <Navigation className="w-4 h-4" />
          <span>{isArabic ? 'بدء التوجيه في الواقع المعزز' : 'Navigate in AR'}</span>
        </button>
      </div>
    </div>
  );

  if (isEmbedded) {
    return <div className="w-full h-full p-2">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      {content}
    </div>
  );
};
