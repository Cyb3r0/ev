import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Navigation, Bookmark, CheckCircle2, Search } from 'lucide-react';
import { JaxEventSchedule, JAX_REAL_EVENTS, JaxDistrictSite, JAX_REAL_SITES } from '../data/jaxRealLocations';

interface OfficialScheduleTabProps {
  events: JaxEventSchedule[];
  sites: JaxDistrictSite[];
  onSelectSiteInLens: (site: JaxDistrictSite) => void;
  isArabic: boolean;
}

export const OfficialScheduleTab: React.FC<OfficialScheduleTabProps> = ({
  events,
  sites,
  onSelectSiteInLens,
  isArabic
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = events.filter((ev) => {
    return (
      !searchQuery.trim() ||
      ev.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.siteCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.organizerAr.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6 pb-28 text-stone-100 bg-[#06080e]">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {isArabic ? 'جدول الفعاليات والمعارض الرسمية' : 'Official Exhibitions & Events Schedule'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {isArabic
                ? 'مواعيد المعارض الدولية والندوات التخصصية في حي جاكس للفنون'
                : 'Current international pavilions and symposiums across JAX Arts District'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث باسم المعرض، الهنجر، أو الجهة المنظمة...' : 'Search exhibitions or organizers...'}
            className="w-full bg-[#0c101a] border border-white/10 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ev) => {
            const relatedSite = sites.find((s) => s.code === ev.siteCode);

            return (
              <div
                key={ev.id}
                className="rounded-2xl overflow-hidden bg-[#0a0e18] border border-white/10 hover:border-cyan-500/50 transition-all shadow-xl flex flex-col justify-between"
              >
                {/* Banner */}
                <div className="relative h-44 w-full bg-black/60">
                  <img src={ev.image} alt={ev.titleAr} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e18] via-transparent to-black/40" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 font-bold text-xs">
                      {ev.siteCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-stone-300 text-xs font-medium">
                      {ev.categoryAr}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-400 mb-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{ev.daysScheduleAr}</span>
                      <span>·</span>
                      <span className="text-cyan-300">{ev.timeSlotAr}</span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {isArabic ? ev.titleAr : ev.titleEn}
                    </h3>

                    <p className="text-xs text-stone-400 mt-1">
                      {isArabic ? ev.siteNameAr : ev.siteNameEn} · {ev.organizerAr}
                    </p>

                    <p className="text-xs text-stone-300 mt-2.5 leading-relaxed line-clamp-2">
                      {ev.summaryAr}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-stone-300 font-semibold">
                      {ev.entryStatusAr}
                    </span>

                    {relatedSite && (
                      <button
                        onClick={() => onSelectSiteInLens(relatedSite)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/20"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تحديد الموقع في الكاميرا' : 'Locate in Lens'}</span>
                      </button>
                    )}
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
