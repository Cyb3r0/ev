import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  Filter,
  Navigation,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  Volume2,
  Info
} from 'lucide-react';
import { JaxEvent, Artwork, JAX_EVENTS } from '../data/jaxData';

interface JaxEventsTabProps {
  events: JaxEvent[];
  artworks: Artwork[];
  selectedArtworkId: string;
  onSelectArtworkForAr: (art: Artwork) => void;
  onOpenAudio: (art: Artwork) => void;
  onOpenDossier: (art: Artwork) => void;
  isArabic: boolean;
}

export const JaxEventsTab: React.FC<JaxEventsTabProps> = ({
  events,
  artworks,
  selectedArtworkId,
  onSelectArtworkForAr,
  onOpenAudio,
  onOpenDossier,
  isArabic
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'artworks'>('events');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEventModal, setSelectedEventModal] = useState<JaxEvent | null>(null);

  const toggleSaveEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedEventIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'TODAY' && ev.isToday) ||
      ev.categoryAr === selectedCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      ev.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.hangarCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.instructorOrHostAr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6 pb-28 text-stone-100 bg-[#07090e]">
      <div className="max-w-4xl mx-auto">
        {/* Top Header & Sub-Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {isArabic ? 'دليل فعاليات ومعارض حي جاكس' : 'JAX Events & Exhibitions Hub'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {isArabic
                ? 'استكشف كافة المعارض الدولية، ورش العمل، وأمسيات الحوار المعاصر'
                : 'Browse all flagship exhibitions, live masterclasses, and cultural panels'}
            </p>
          </div>

          {/* Sub-Tabs: Events vs Permanent Works */}
          <div className="flex p-1 rounded-xl bg-[#0f1422] border border-white/10 shrink-0">
            <button
              onClick={() => setActiveSubTab('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'events'
                  ? 'bg-cyan-400 text-stone-950 shadow-md shadow-cyan-400/25'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isArabic ? `الفعاليات (${events.length})` : `Events (${events.length})`}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('artworks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'artworks'
                  ? 'bg-cyan-400 text-stone-950 shadow-md shadow-cyan-400/25'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isArabic ? `المعارض (${artworks.length})` : `Artworks (${artworks.length})`}</span>
            </button>
          </div>
        </div>

        {/* ===================== VIEW 1: EVENTS LIST ===================== */}
        {activeSubTab === 'events' && (
          <div className="mt-4 space-y-4">
            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'ابحث باسم الفعالية، الفنان، أو رقم الهنجر...'
                      : 'Search event, artist, or hangar...'
                  }
                  className="w-full bg-[#0d111d] border border-white/10 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === 'ALL'
                      ? 'bg-cyan-400 text-stone-950 shadow-md shadow-cyan-400/20'
                      : 'bg-[#121624] text-stone-400 hover:text-white border border-white/5'
                  }`}
                >
                  {isArabic ? 'الكل' : 'All'}
                </button>
                <button
                  onClick={() => setSelectedCategory('TODAY')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                    selectedCategory === 'TODAY'
                      ? 'bg-cyan-400 text-stone-950 shadow-md shadow-cyan-400/20'
                      : 'bg-[#121624] text-amber-300 hover:text-white border border-amber-500/20'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isArabic ? 'اليوم' : 'Today'}</span>
                </button>
                {['معارض رئيسية', 'ورش عمل', 'حوارات ثقافية', 'عروض حية'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-cyan-400 text-stone-950 shadow-md shadow-cyan-400/20'
                        : 'bg-[#121624] text-stone-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div className="py-16 text-center text-stone-400 bg-[#0c101a] rounded-2xl border border-white/5">
                <Calendar className="w-10 h-10 mx-auto text-stone-600 mb-2" />
                <p className="text-sm font-semibold">
                  {isArabic ? 'لم يتم العثور على فعاليات مطابقة' : 'No matching events found'}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {isArabic ? 'جرب البحث بكلمات أخرى أو اختر كافة الفئات' : 'Try searching for another keyword'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((ev) => {
                  const isSaved = savedEventIds.includes(ev.id);

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventModal(ev)}
                      className="rounded-2xl overflow-hidden bg-[#0c101b] border border-white/10 hover:border-cyan-400/50 transition-all shadow-xl cursor-pointer flex flex-col justify-between group"
                    >
                      {/* Image Banner */}
                      <div className="relative h-44 w-full overflow-hidden bg-black/60">
                        <img
                          src={ev.image}
                          alt={ev.titleAr}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c101b] via-transparent to-black/40" />

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-cyan-400/40 text-cyan-300 font-bold text-[10px]">
                              {ev.hangarCode}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-stone-200 text-[10px] font-medium">
                              {ev.categoryAr}
                            </span>
                          </div>

                          {/* Save Bookmark button */}
                          <button
                            onClick={(e) => toggleSaveEvent(ev.id, e)}
                            className="p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-stone-300 hover:text-cyan-300 transition"
                            title={isSaved ? (isArabic ? 'محفوظ' : 'Saved') : (isArabic ? 'حفظ' : 'Save')}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Today Pulse Badge */}
                        {ev.isToday && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/50 backdrop-blur-md text-[10px] text-amber-300 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span>{isArabic ? 'تقام اليوم' : 'Happening Today'}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Box */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{ev.dateTimeAr}</span>
                            <span>·</span>
                            <span className="font-mono text-cyan-300">{ev.timeSlot}</span>
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition leading-snug">
                            {isArabic ? ev.titleAr : ev.titleEn}
                          </h3>

                          <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-stone-500 shrink-0" />
                            <span className="truncate">{ev.instructorOrHostAr}</span>
                          </p>

                          <p className="text-xs text-stone-300 mt-2.5 leading-relaxed line-clamp-2">
                            {ev.descriptionAr}
                          </p>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-semibold text-stone-300">
                            {ev.statusAr}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetArt = artworks.find(
                                (a) => a.id === ev.featuredArtworkId || a.hangarCode === ev.hangarCode
                              );
                              if (targetArt) onSelectArtworkForAr(targetArt);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-[11px] transition shadow-md shadow-cyan-400/20"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'توجيه AR للهنجر' : 'Navigate in AR'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== VIEW 2: PERMANENT ARTWORKS ===================== */}
        {activeSubTab === 'artworks' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {artworks.map((art) => (
              <div
                key={art.id}
                className="rounded-2xl overflow-hidden bg-[#0c101a] border border-white/10 hover:border-cyan-400/50 transition shadow-xl flex flex-col justify-between"
              >
                <div className="relative h-48 w-full overflow-hidden bg-black/60">
                  <img
                    src={art.image}
                    alt={art.titleAr}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c101a] via-transparent to-black/30" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-bold text-[10px]">
                      {art.hangarCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-stone-300 text-[10px]">
                      {art.year}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-md text-[10px] font-mono text-cyan-300 font-bold">
                    <Navigation className="w-3 h-3 text-cyan-400" />
                    <span>{art.initialDistanceMeters}m</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {isArabic ? art.titleAr : art.titleEn}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {isArabic ? art.artistAr : art.artistEn} · {isArabic ? art.hangarNameAr : art.hangarNameEn}
                    </p>
                    <p className="text-xs text-stone-300 mt-2 leading-relaxed line-clamp-2">
                      {isArabic ? art.descriptionAr : art.descriptionEn}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={() => onSelectArtworkForAr(art)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/20"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'فتح في عدسة AR' : 'Open in AR'}</span>
                    </button>
                    <button
                      onClick={() => onOpenAudio(art)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition"
                      title="Audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenDossier(art)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 transition"
                      title="Info"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================== EVENT DETAIL MODAL ===================== */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b0e17] border border-cyan-500/40 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 text-stone-100 shadow-2xl relative">
            <button
              onClick={() => setSelectedEventModal(null)}
              className="absolute top-4 left-4 p-1 rounded-full text-stone-400 hover:text-white"
            >
              ✕
            </button>

            {/* Modal Image */}
            <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4">
              <img
                src={selectedEventModal.image}
                alt={selectedEventModal.titleAr}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/80 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                {selectedEventModal.hangarCode}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
              <span className="text-cyan-400 font-semibold">{selectedEventModal.categoryAr}</span>
              <span>·</span>
              <span>{selectedEventModal.statusAr}</span>
            </div>

            <h3 className="text-lg font-black text-white">{selectedEventModal.titleAr}</h3>

            <div className="my-3 p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedEventModal.dateTimeAr} ({selectedEventModal.timeSlot})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedEventModal.hangarNameAr}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedEventModal.instructorOrHostAr}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isArabic ? 'الفئة المستهدفة: ' : 'Audience: '} {selectedEventModal.targetAudienceAr}</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-stone-300 my-4">
              {selectedEventModal.descriptionAr}
            </p>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  const targetArt = artworks.find(
                    (a) =>
                      a.id === selectedEventModal.featuredArtworkId ||
                      a.hangarCode === selectedEventModal.hangarCode
                  );
                  if (targetArt) onSelectArtworkForAr(targetArt);
                  setSelectedEventModal(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-lg shadow-cyan-400/20"
              >
                <Navigation className="w-4 h-4" />
                <span>{isArabic ? 'بدء التوجيه الميداني في الواقع المعزز' : 'Navigate in AR'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
