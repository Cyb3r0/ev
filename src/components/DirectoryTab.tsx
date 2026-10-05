import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Search, CheckCircle2, ChevronRight, Layers, Info } from 'lucide-react';
import { JaxDistrictSite, JAX_REAL_SITES } from '../data/jaxRealLocations';
import { GpsTelemetry, computeDistanceMeters } from '../services/geolocationService';

interface DirectoryTabProps {
  gpsTelemetry: GpsTelemetry | null;
  sites: JaxDistrictSite[];
  selectedSiteId: string;
  onSelectSite: (site: JaxDistrictSite) => void;
  onOpenDetails: (site: JaxDistrictSite) => void;
  isArabic: boolean;
}

export const DirectoryTab: React.FC<DirectoryTabProps> = ({
  gpsTelemetry,
  sites,
  selectedSiteId,
  onSelectSite,
  onOpenDetails,
  isArabic
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add real-time distance to each site and sort by distance from user GPS
  const sitesWithDistance = sites.map((site) => {
    const dist = gpsTelemetry
      ? computeDistanceMeters(gpsTelemetry.latitude, gpsTelemetry.longitude, site.lat, site.lng)
      : null;
    return { ...site, calculatedDistance: dist };
  });

  // Sort: closest site first if GPS available
  const sortedSites = [...sitesWithDistance].sort((a, b) => {
    if (a.calculatedDistance !== null && b.calculatedDistance !== null) {
      return a.calculatedDistance - b.calculatedDistance;
    }
    return 0;
  });

  const filtered = sortedSites.filter((s) => {
    const matchesType = filterType === 'ALL' || s.typeAr === filterType;
    const matchesSearch =
      !searchQuery.trim() ||
      s.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6 pb-28 text-stone-100 bg-[#06080e]">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {isArabic ? 'دليل مواقع وهناجر حي جاكس' : 'JAX Pavilions & Sites Directory'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {isArabic
                ? 'مرتبة تلقائياً حسب المسافة الأقرب من موقعك الجغرافي الفعلي (GPS)'
                : 'Automatically sorted by closest distance to your live GPS coordinates'}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'ابحث برقم الهنجر أو اسم المعلم...' : 'Search by code or title...'}
              className="w-full bg-[#0c101a] border border-white/10 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'هنجر رئيسي', 'حديقة مفتوحة', 'ساحة عامة', 'بوابة ومواقف'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterType === type
                    ? 'bg-cyan-400 text-stone-950 shadow-md shadow-cyan-400/20'
                    : 'bg-[#101522] text-stone-400 hover:text-white border border-white/5'
                }`}
              >
                {type === 'ALL' ? (isArabic ? 'كافة المواقع' : 'All Sites') : type}
              </button>
            ))}
          </div>
        </div>

        {/* Directory List */}
        <div className="space-y-3">
          {filtered.map((site) => {
            const isSelected = site.id === selectedSiteId;
            const isArrived = site.calculatedDistance !== null && site.calculatedDistance <= 15;

            return (
              <div
                key={site.id}
                className={`rounded-2xl p-4 bg-[#0a0e18] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isArrived
                    ? 'border-emerald-400/70 shadow-[0_0_20px_rgba(52,211,153,0.15)]'
                    : isSelected
                    ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Info Block */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={site.image}
                    alt={site.titleAr}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/30">
                        {site.code}
                      </span>
                      <span className="text-xs text-stone-400">
                        {isArabic ? site.typeAr : site.typeEn}
                      </span>
                      {isArrived && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-bold">
                          {isArabic ? 'أنت في الموقع مباشرة' : 'At Site Now'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1">
                      {isArabic ? site.titleAr : site.titleEn}
                    </h3>

                    <p className="text-xs text-stone-400 mt-0.5">
                      {isArabic ? site.primaryExhibitionAr : site.primaryExhibitionEn}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1.5 font-mono">
                      <span>{site.openingHoursAr}</span>
                    </div>
                  </div>
                </div>

                {/* Distance & Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-right">
                    <span className="block font-mono font-bold text-sm text-cyan-400">
                      {site.calculatedDistance !== null ? `${site.calculatedDistance}m` : '—'}
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      {isArabic ? 'المسافة المحسوبة' : 'Calculated'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDetails(site)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 transition"
                      title={isArabic ? 'تفاصيل' : 'Details'}
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectSite(site)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/20"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'فتح في الكاميرا' : 'View in Lens'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
