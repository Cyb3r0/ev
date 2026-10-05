import React from 'react';
import { X, MapPin, Clock, Navigation, CheckCircle2, ExternalLink, ShieldCheck, Layers } from 'lucide-react';
import { JaxDistrictSite } from '../data/jaxRealLocations';
import { formatCoordinates } from '../services/geolocationService';

interface SiteDetailsModalProps {
  site: JaxDistrictSite;
  isArabic: boolean;
  onClose: () => void;
  onSelectInLens: (site: JaxDistrictSite) => void;
}

export const SiteDetailsModal: React.FC<SiteDetailsModalProps> = ({
  site,
  isArabic,
  onClose,
  onSelectInLens
}) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0a0e18] border border-white/20 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 text-stone-100 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/40">
            {site.code}
          </span>
          <span className="text-xs text-stone-400">
            {isArabic ? site.typeAr : site.typeEn}
          </span>
        </div>

        <h3 className="text-xl font-black text-white leading-snug mb-3">
          {isArabic ? site.titleAr : site.titleEn}
        </h3>

        {/* Image Preview */}
        <div className="relative h-56 w-full rounded-xl overflow-hidden border border-white/10 mb-4 bg-black">
          <img src={site.image} alt={site.titleAr} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 font-mono text-[11px] text-cyan-300 border border-white/10">
            {formatCoordinates(site.lat, site.lng)}
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs mb-4">
          <div>
            <span className="text-stone-400 block mb-0.5">{isArabic ? 'المعرض الرئيسي:' : 'Primary Exhibit:'}</span>
            <span className="font-bold text-white block">{isArabic ? site.primaryExhibitionAr : site.primaryExhibitionEn}</span>
          </div>

          <div>
            <span className="text-stone-400 block mb-0.5">{isArabic ? 'الجهة المشرفة:' : 'Authority:'}</span>
            <span className="font-bold text-white block">{isArabic ? site.creatorOrCuratorAr : site.creatorOrCuratorEn}</span>
          </div>

          <div>
            <span className="text-stone-400 block mb-0.5">{isArabic ? 'مواعيد العمل:' : 'Opening Hours:'}</span>
            <span className="text-cyan-300 font-mono block">{isArabic ? site.openingHoursAr : site.openingHoursEn}</span>
          </div>

          <div>
            <span className="text-stone-400 block mb-0.5">{isArabic ? 'الإحداثيات الجغرافية:' : 'Coordinates:'}</span>
            <span className="text-stone-300 font-mono block">{site.lat.toFixed(5)}° N, {site.lng.toFixed(5)}° E</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
            {isArabic ? 'الوصف المعماري والميداني:' : 'Architectural & Field Overview:'}
          </h4>
          <p className="text-xs text-stone-300 leading-relaxed">
            {isArabic ? site.descriptionAr : site.descriptionEn}
          </p>
        </div>

        {/* Facilities */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
            {isArabic ? 'المرافق والخدمات المتوفرة:' : 'Site Facilities:'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {(isArabic ? site.facilitiesAr : site.facilitiesEn).map((fac, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-stone-200"
              >
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>{fac}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white/10">
          <button
            onClick={() => {
              onSelectInLens(site);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/25"
          >
            <Navigation className="w-4 h-4" />
            <span>{isArabic ? 'تحديد الموقع في عدسة الكاميرا' : 'Locate in AR Lens'}</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 font-bold text-xs transition border border-white/10 shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{isArabic ? 'فتح في خرائط جوجل' : 'Google Maps'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
