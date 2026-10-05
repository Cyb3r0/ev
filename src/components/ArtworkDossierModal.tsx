import React from 'react';
import { X, Volume2, MapPin, Layers } from 'lucide-react';
import { Artwork } from '../data/jaxData';

interface ArtworkDossierModalProps {
  artwork: Artwork;
  isArabic: boolean;
  onClose: () => void;
  onOpenAudio: () => void;
  onOpenMap: () => void;
}

export const ArtworkDossierModal: React.FC<ArtworkDossierModalProps> = ({
  artwork,
  isArabic,
  onClose,
  onOpenAudio,
  onOpenMap
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b0e17] border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 text-stone-100 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            {artwork.hangarCode}
          </span>
          <span>·</span>
          <span>{artwork.year}</span>
          <span>·</span>
          <span>{isArabic ? artwork.categoryAr : artwork.categoryEn}</span>
        </div>

        {/* Title & Artist */}
        <h2 className="text-2xl font-black text-white mt-3">
          {isArabic ? artwork.titleAr : artwork.titleEn}
        </h2>
        <p className="text-sm font-semibold text-stone-300 mt-1">
          {isArabic ? artwork.artistAr : artwork.artistEn}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            onClick={() => {
              onClose();
              onOpenAudio();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 text-xs font-bold transition shadow-md shadow-cyan-400/20"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isArabic ? 'تشغيل الدليل الصوتي' : 'Play Audio Guide'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenMap();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition"
          >
            <MapPin className="w-4 h-4 text-cyan-300" />
            <span>{isArabic ? 'تحديد الموقع على الخريطة' : 'Locate on District Map'}</span>
          </button>
        </div>

        {/* Accession Details Table */}
        <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-stone-400">{isArabic ? 'الموقع والمعرض' : 'Location & Pavilion'}</span>
            <span className="font-semibold text-stone-200">
              {artwork.hangarCode} ({isArabic ? artwork.hangarNameAr : artwork.hangarNameEn})
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-stone-400">{isArabic ? 'الخامات والوسائط' : 'Medium & Material'}</span>
            <span className="font-semibold text-stone-200">
              {isArabic ? artwork.mediumAr : artwork.mediumEn}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-stone-400">{isArabic ? 'الأبعاد' : 'Dimensions'}</span>
            <span className="font-semibold text-stone-200">{artwork.dimensions}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-stone-400">{isArabic ? 'المسافة التقديرية' : 'Estimated Distance'}</span>
            <span className="font-semibold text-cyan-300">{artwork.initialDistanceMeters}m</span>
          </div>
        </div>

        {/* Narrative & Curatorial Essay */}
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-1">
              {isArabic ? 'عن العمل والتكوين البصري' : 'Visual Concept'}
            </h4>
            <p className="text-xs leading-relaxed text-stone-300">
              {isArabic ? artwork.descriptionAr : artwork.descriptionEn}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-cyan-400 mb-1">
              {isArabic ? 'القراءة النقدية القيّمية' : 'Curatorial Monograph'}
            </h4>
            <p className="text-xs leading-relaxed text-stone-300">
              {isArabic ? artwork.curatorialEssayAr : artwork.curatorialEssayEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
