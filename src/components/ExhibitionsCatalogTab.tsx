import React, { useState } from 'react';
import { Artwork, JAX_ARTWORKS } from '../data/jaxData';
import { Navigation, Volume2, Info, Eye, Sparkles } from 'lucide-react';

interface ExhibitionsCatalogTabProps {
  artworks: Artwork[];
  selectedArtworkId: string;
  onSelectArtwork: (art: Artwork) => void;
  onOpenAudio: (art: Artwork) => void;
  onOpenDossier: (art: Artwork) => void;
  isArabic: boolean;
}

export const ExhibitionsCatalogTab: React.FC<ExhibitionsCatalogTabProps> = ({
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  onOpenAudio,
  onOpenDossier,
  isArabic
}) => {
  const [filterHangar, setFilterHangar] = useState<string>('ALL');

  const filtered = filterHangar === 'ALL'
    ? artworks
    : artworks.filter((a) => a.hangarCode === filterHangar);

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6 pb-28 text-stone-100 bg-[#07090e]">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-5">
        <h2 className="text-2xl font-black text-white">
          {isArabic ? 'دليل الأعمال والمعارض الحالية' : 'JAX Exhibitions & Artworks'}
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          {isArabic
            ? 'استعرض المعالم الفنية الحقيقية والمنحوتات المعمارية في حي جاكس مع التوجيه الميداني'
            : 'Explore real landmark sculptures and pavilion installations across JAX Arts District'}
        </p>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto mt-4 pb-1">
          <button
            onClick={() => setFilterHangar('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              filterHangar === 'ALL'
                ? 'bg-cyan-400 text-stone-950 shadow-md shadow-cyan-400/20'
                : 'bg-[#121622] text-stone-400 hover:text-white border border-white/5'
            }`}
          >
            {isArabic ? 'كافة المعالم' : 'All Works'}
          </button>
          {['JAX 01', 'JAX 03', 'JAX 12', 'JAX 15'].map((code) => (
            <button
              key={code}
              onClick={() => setFilterHangar(code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                filterHangar === code
                  ? 'bg-cyan-400 text-stone-950 shadow-md shadow-cyan-400/20'
                  : 'bg-[#121622] text-stone-400 hover:text-white border border-white/5'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Real Photographic Artworks */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((art) => {
          const isSelected = art.id === selectedArtworkId;

          return (
            <div
              key={art.id}
              className={`rounded-2xl overflow-hidden bg-[#0c101a] border transition shadow-xl flex flex-col ${
                isSelected ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border-white/10 hover:border-cyan-500/40'
              }`}
            >
              {/* Real Photography Preview */}
              <div className="relative h-52 w-full overflow-hidden bg-black/60">
                <img
                  src={art.image}
                  alt={art.titleAr}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c101a] via-transparent to-black/30" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-bold text-[10px]">
                    {art.hangarCode}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-stone-300 text-[10px]">
                    {art.year}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-md text-[11px] font-mono text-cyan-300 font-bold">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span>{art.initialDistanceMeters}m</span>
                </div>
              </div>

              {/* Information & Description */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {isArabic ? art.titleAr : art.titleEn}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5 font-medium">
                    {isArabic ? art.artistAr : art.artistEn} · {isArabic ? art.hangarNameAr : art.hangarNameEn}
                  </p>
                  <p className="text-xs text-stone-300 mt-2.5 leading-relaxed line-clamp-2">
                    {isArabic ? art.descriptionAr : art.descriptionEn}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => onSelectArtwork(art)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/20"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'فتح في عدسة AR' : 'Open in AR Lens'}</span>
                  </button>

                  <button
                    onClick={() => onOpenAudio(art)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition"
                    title={isArabic ? 'المرشد الصوتي' : 'Audio Guide'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenDossier(art)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 transition"
                    title={isArabic ? 'ملف العمل الكامل' : 'Full Dossier'}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
