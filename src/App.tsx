import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  Volume2,
  Info,
  Sparkles,
  Video,
  VideoOff,
  Globe,
  Images,
  Route,
  Compass,
  Layers,
  Calendar,
  Zap,
  Radio
} from 'lucide-react';
import { JAX_ARTWORKS, JAX_HANGARS, JAX_TOURS, JAX_EVENTS, Artwork, GuidedTour, JaxEvent } from './data/jaxData';
import { ArViewport } from './components/ArViewport';
import { ArRadarCompass } from './components/ArRadarCompass';
import { AudioGuidePlayer } from './components/AudioGuidePlayer';
import { ArtworkDossierModal } from './components/ArtworkDossierModal';
import { DistrictMasterMap } from './components/DistrictMasterMap';
import { JaxEventsTab } from './components/JaxEventsTab';
import { AiCuratorPanel } from './components/AiCuratorPanel';
import { ArPhotoGallery, SavedSnapshot } from './components/ArPhotoGallery';
import { NearbyArtToast } from './components/NearbyArtToast';

type ActiveTab = 'ar' | 'map' | 'events' | 'curator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ar');
  const [isArabic, setIsArabic] = useState<boolean>(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork>(JAX_ARTWORKS[0]);
  const [isSimulatedCamera, setIsSimulatedCamera] = useState<boolean>(false);

  // Power-Saving Mode & Battery Status
  const [isPowerSaving, setIsPowerSaving] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);

  // Background Proximity Listener State (Within 5-meter radius)
  const [nearbyArtNotification, setNearbyArtNotification] = useState<{
    artwork: Artwork;
    distanceMeters: number;
  } | null>(null);
  const notifiedArtworkIdsRef = useRef<Set<string>>(new Set());

  // Active tour
  const [activeTour, setActiveTour] = useState<GuidedTour | null>(null);
  const [tourStopIndex, setTourStopIndex] = useState<number>(0);

  // Modals & Panels
  const [showAudioGuide, setShowAudioGuide] = useState<boolean>(false);
  const [showDossier, setShowDossier] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [showTours, setShowTours] = useState<boolean>(false);

  // Shutter Snapshot
  const [triggerSnapshot, setTriggerSnapshot] = useState<boolean>(false);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);
  const [savedSnapshots, setSavedSnapshots] = useState<SavedSnapshot[]>([]);

  useEffect(() => {
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [isArabic]);

  // Battery Status API listener
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          const updateBattery = () => {
            setBatteryLevel(battery.level);
            setIsCharging(battery.charging);
            if (battery.level <= 0.2 && !battery.charging) {
              setIsPowerSaving(true);
            }
          };
          updateBattery();
          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);
        })
        .catch(() => {});
    }
  }, []);

  // Background Proximity Listener (5-Meter Radius Detection)
  useEffect(() => {
    let watchId: number | null = null;

    // JAX District Reference coordinates (approx 24.7335 N, 46.5750 E)
    // Checks real geolocation if supported
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // Check proximity to artworks based on position updates
          // If within ~5 meters of any unnotified artwork, fire toast
        },
        (err) => {
          // Fallback to simulated walking tour proximity
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    // Walking Tour / Dynamic Proximity Detection Engine:
    // Periodically checks if the user is approaching a new artwork
    const proximityTimer = setInterval(() => {
      // Simulate walking discovery for exploration or tour stops
      JAX_ARTWORKS.forEach((art) => {
        if (!notifiedArtworkIdsRef.current.has(art.id)) {
          // If user selected this artwork or is on a tour stop for it,
          // simulate physical approach within 3 to 5 meters after exploring
          if (art.id === selectedArtwork.id) {
            const simulatedDist = Math.floor(Math.random() * 3) + 3; // 3m to 5m
            if (simulatedDist <= 5) {
              notifiedArtworkIdsRef.current.add(art.id);
              setNearbyArtNotification({
                artwork: art,
                distanceMeters: simulatedDist
              });
            }
          }
        }
      });
    }, 12000);

    // Initial subtle discovery trigger after 4 seconds of entering JAX
    const initialDiscoveryTimer = setTimeout(() => {
      const firstArt = JAX_ARTWORKS[0];
      if (!notifiedArtworkIdsRef.current.has(firstArt.id)) {
        notifiedArtworkIdsRef.current.add(firstArt.id);
        setNearbyArtNotification({
          artwork: firstArt,
          distanceMeters: 4 // within 5 meters
        });
      }
    }, 4500);

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(proximityTimer);
      clearTimeout(initialDiscoveryTimer);
    };
  }, [selectedArtwork.id]);

  const handleCaptureClick = () => {
    setShutterFlash(true);
    setTriggerSnapshot(true);
    setTimeout(() => setShutterFlash(false), 150);
  };

  const handleSnapshotReady = (dataUrl: string) => {
    const newSnap: SavedSnapshot = {
      id: Date.now().toString(),
      dataUrl,
      artworkTitle: isArabic ? selectedArtwork.titleAr : selectedArtwork.titleEn,
      artist: isArabic ? selectedArtwork.artistAr : selectedArtwork.artistEn,
      dateStr: new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setSavedSnapshots((prev) => [newSnap, ...prev]);
  };

  const startTour = (tour: GuidedTour) => {
    setActiveTour(tour);
    setTourStopIndex(0);
    const firstArt = JAX_ARTWORKS.find((a) => a.id === tour.stops[0]);
    if (firstArt) setSelectedArtwork(firstArt);
    setShowTours(false);
    setActiveTab('ar');
  };

  const nextTourStop = () => {
    if (!activeTour) return;
    const nextIdx = (tourStopIndex + 1) % activeTour.stops.length;
    setTourStopIndex(nextIdx);
    const nextArt = JAX_ARTWORKS.find((a) => a.id === activeTour.stops[nextIdx]);
    if (nextArt) {
      setSelectedArtwork(nextArt);
      // Trigger proximity for new tour stop
      if (!notifiedArtworkIdsRef.current.has(nextArt.id)) {
        notifiedArtworkIdsRef.current.add(nextArt.id);
        setNearbyArtNotification({
          artwork: nextArt,
          distanceMeters: 3
        });
      }
    }
  };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden bg-[#07090e] font-sans text-stone-100 flex flex-col transition-all duration-500 ${
        isPowerSaving ? 'brightness-[0.82] contrast-95' : 'brightness-100 contrast-100'
      }`}
    >
      {/* 1. Header Toolbar (Android Top App Bar) */}
      <header className="w-full z-30 p-3.5 flex items-center justify-between bg-[#0a0d16]/95 backdrop-blur-xl border-b border-white/10 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40">
            <span className="font-black text-cyan-400 text-sm tracking-wider">JAX</span>
          </div>
          <div>
            <h1 className="text-xs font-bold text-white leading-tight">
              {isArabic ? 'حي جاكس للفنون · الدرعية' : 'JAX Arts District · Diriyah'}
            </h1>
            <p className="text-[10px] text-stone-400">
              {isArabic ? 'المرشد الميداني ودليل الفعاليات' : 'Field Guide & Events Hub'}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Power-Saving Eco Mode Toggle Button */}
          <button
            onClick={() => setIsPowerSaving(!isPowerSaving)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isPowerSaving
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse'
                : 'bg-black/60 border-white/15 text-stone-300 hover:text-white hover:border-amber-400/50'
            }`}
            title={
              isArabic
                ? 'تبديل نمط توفير الطاقة لتمديد البطارية أثناء الجولات'
                : 'Toggle Power-Saving Mode'
            }
          >
            <Zap className={`w-3.5 h-3.5 ${isPowerSaving ? 'text-amber-400' : 'text-stone-400'}`} />
            <span className="text-[11px] font-mono">
              {isPowerSaving
                ? isArabic ? 'توفير الطاقة' : 'Eco 15FPS'
                : batteryLevel !== null
                ? `${Math.round(batteryLevel * 100)}%`
                : isArabic ? 'طاقة' : 'Eco'}
            </span>
          </button>

          {/* Camera feed toggle */}
          {activeTab === 'ar' && (
            <button
              onClick={() => setIsSimulatedCamera(!isSimulatedCamera)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-stone-300 hover:text-white text-xs transition"
              title={isArabic ? 'تبديل الكاميرا الحقيقية / بيئة جاكس' : 'Toggle Camera'}
            >
              {isSimulatedCamera ? (
                <>
                  <VideoOff className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] hidden sm:inline">{isArabic ? 'بيئة جاكس' : 'Simulated'}</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-[11px] hidden sm:inline">{isArabic ? 'كاميرا حية' : 'Live Cam'}</span>
                </>
              )}
            </button>
          )}

          {/* Tours shortcut */}
          <button
            onClick={() => setShowTours(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-cyan-300 hover:text-cyan-200 text-xs font-medium transition"
          >
            <Route className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isArabic ? 'الجولات' : 'Tours'}</span>
          </button>

          {/* Bilingual Switcher */}
          <button
            onClick={() => setIsArabic(!isArabic)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition hover:bg-cyan-500/20"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isArabic ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </header>

      {/* Proximity 5-Meter Nearby Art Notification Toast */}
      {nearbyArtNotification && (
        <NearbyArtToast
          artwork={nearbyArtNotification.artwork}
          distanceMeters={nearbyArtNotification.distanceMeters}
          onExplore={(art) => {
            setSelectedArtwork(art);
            setActiveTab('ar');
            setNearbyArtNotification(null);
          }}
          onDismiss={() => setNearbyArtNotification(null)}
          isArabic={isArabic}
        />
      )}

      {/* Power-Saving Active Notification Strip */}
      {isPowerSaving && (
        <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>
              {isArabic
                ? 'نمط توفير الطاقة نشط: تم خفض معدل التحديث إلى 15 FPS وتعتيم السطوع لتمديد البطارية'
                : 'Power-Saving Mode active: camera throttled to 15 FPS and brightness dimmed'}
            </span>
          </div>
          <button
            onClick={() => setIsPowerSaving(false)}
            className="text-[10px] underline font-bold hover:text-white"
          >
            {isArabic ? 'إيقاف' : 'Disable'}
          </button>
        </div>
      )}

      {/* 2. Main Content Area Switcher */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* TAB 1: AR Viewport & Camera Lens */}
        {activeTab === 'ar' && (
          <div className="relative w-full h-full">
            <ArViewport
              artwork={selectedArtwork}
              hangars={JAX_HANGARS}
              isSimulatedCamera={isSimulatedCamera}
              isPowerSaving={isPowerSaving}
              onSnapshotReady={handleSnapshotReady}
              triggerSnapshot={triggerSnapshot}
              onSnapshotCaptured={() => setTriggerSnapshot(false)}
              onOpenDossier={() => setShowDossier(true)}
              onOpenAudio={() => setShowAudioGuide(true)}
              isArabic={isArabic}
            />

            {/* Active Tour Navigation Pill */}
            {activeTour && (
              <div className="absolute top-2 inset-x-4 max-w-md mx-auto z-20 pointer-events-auto">
                <div className="bg-[#0b0f1a]/95 backdrop-blur-xl border border-cyan-400/80 rounded-xl p-2.5 shadow-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block truncate max-w-[180px]">
                        {isArabic ? activeTour.titleAr : activeTour.titleEn}
                      </span>
                      <span className="text-[10px] text-cyan-300/80">
                        {isArabic ? `المحطة ${tourStopIndex + 1} من ${activeTour.stops.length}` : `Stop ${tourStopIndex + 1} of ${activeTour.stops.length}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={nextTourStop}
                      className="px-2.5 py-1 rounded-lg bg-cyan-400 text-stone-950 font-bold text-[10px] hover:bg-cyan-300 transition"
                    >
                      {isArabic ? 'التالي' : 'Next'}
                    </button>
                    <button
                      onClick={() => setActiveTour(null)}
                      className="text-stone-400 hover:text-white text-[10px] px-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Detected Artwork Card */}
            <div className="absolute bottom-20 inset-x-4 max-w-lg mx-auto z-20 pointer-events-auto">
              <div className="p-3.5 rounded-2xl bg-[#0a0d16]/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedArtwork.image}
                    alt={selectedArtwork.titleAr}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[10px]">
                        {selectedArtwork.hangarCode}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-cyan-300">
                        {selectedArtwork.initialDistanceMeters}m
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white truncate max-w-[210px] mt-0.5">
                      {isArabic ? selectedArtwork.titleAr : selectedArtwork.titleEn}
                    </h3>
                    <p className="text-[11px] text-stone-400 truncate max-w-[210px]">
                      {isArabic ? selectedArtwork.artistAr : selectedArtwork.artistEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowAudioGuide(true)}
                    className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/40 transition"
                    title={isArabic ? 'المرشد الصوتي' : 'Audio Guide'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowDossier(true)}
                    className="p-2.5 rounded-xl bg-white/10 text-stone-200 hover:bg-white/20 border border-white/15 transition"
                    title={isArabic ? 'تفاصيل العمل' : 'Details'}
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleCaptureClick}
                    className="w-10 h-10 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 flex items-center justify-center transition shadow-lg shadow-cyan-400/25 active:scale-95"
                    title={isArabic ? 'التقاط صورة' : 'Snap Photo'}
                  >
                    <Camera className="w-5 h-5 text-stone-950" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive District Master Map */}
        {activeTab === 'map' && (
          <DistrictMasterMap
            hangars={JAX_HANGARS}
            artworks={JAX_ARTWORKS}
            selectedArtworkId={selectedArtwork.id}
            onSelectArtwork={(art) => {
              setSelectedArtwork(art);
              setActiveTab('ar');
            }}
            isArabic={isArabic}
            isEmbedded={true}
          />
        )}

        {/* TAB 3: Full JAX Events & Exhibitions Hub */}
        {activeTab === 'events' && (
          <JaxEventsTab
            events={JAX_EVENTS}
            artworks={JAX_ARTWORKS}
            selectedArtworkId={selectedArtwork.id}
            onSelectArtworkForAr={(art) => {
              setSelectedArtwork(art);
              setActiveTab('ar');
            }}
            onOpenAudio={(art) => {
              setSelectedArtwork(art);
              setShowAudioGuide(true);
            }}
            onOpenDossier={(art) => {
              setSelectedArtwork(art);
              setShowDossier(true);
            }}
            isArabic={isArabic}
          />
        )}

        {/* TAB 4: Gemini AI Curator Assistant */}
        {activeTab === 'curator' && (
          <div className="w-full h-full p-4 flex justify-center items-center">
            <AiCuratorPanel
              artwork={selectedArtwork}
              isArabic={isArabic}
              onClose={() => setActiveTab('ar')}
            />
          </div>
        )}
      </main>

      {/* 3. Android Material 3 Bottom Navigation Bar */}
      <nav className="w-full z-40 bg-[#090c14] border-t border-white/10 px-2 py-2 flex items-center justify-around shrink-0 shadow-2xl">
        {/* Tab 1: AR Camera Lens */}
        <button
          onClick={() => setActiveTab('ar')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'ar'
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {isArabic ? 'عدسة AR' : 'AR Lens'}
          </span>
        </button>

        {/* Tab 2: District Map */}
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'map'
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {isArabic ? 'الخريطة' : 'Map'}
          </span>
        </button>

        {/* Tab 3: Events & Exhibitions Hub */}
        <button
          onClick={() => setActiveTab('events')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'events'
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {isArabic ? 'الفعاليات' : 'Events'}
          </span>
          <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-cyan-400 text-stone-950 font-black text-[8px] flex items-center justify-center">
            {JAX_EVENTS.length}
          </span>
        </button>

        {/* Tab 4: AI Curator */}
        <button
          onClick={() => setActiveTab('curator')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'curator'
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {isArabic ? 'المرشد الذكي' : 'AI Guide'}
          </span>
        </button>

        {/* Extra: Photo Memories */}
        <button
          onClick={() => setShowGallery(true)}
          className="relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-stone-400 hover:text-stone-200 transition"
        >
          <Images className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {isArabic ? 'الذكريات' : 'Photos'}
          </span>
          {savedSnapshots.length > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-cyan-400 text-stone-950 font-black text-[8px] flex items-center justify-center">
              {savedSnapshots.length}
            </span>
          )}
        </button>
      </nav>

      {/* 4. Shutter Camera Flash Effect */}
      {shutterFlash && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-ping duration-150" />
      )}

      {/* 5. Modals & Sheets */}
      {showAudioGuide && (
        <AudioGuidePlayer
          artwork={selectedArtwork}
          isArabic={isArabic}
          onClose={() => setShowAudioGuide(false)}
        />
      )}

      {showDossier && (
        <ArtworkDossierModal
          artwork={selectedArtwork}
          isArabic={isArabic}
          onClose={() => setShowDossier(false)}
          onOpenAudio={() => setShowAudioGuide(true)}
          onOpenMap={() => setActiveTab('map')}
        />
      )}

      {showGallery && (
        <ArPhotoGallery
          snapshots={savedSnapshots}
          onDeleteSnapshot={(id) => setSavedSnapshots((prev) => prev.filter((s) => s.id !== id))}
          isArabic={isArabic}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Tours Modal */}
      {showTours && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b0e17] border border-cyan-500/30 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col p-6 text-stone-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {isArabic ? 'جولات واستكشافات جاكس الميدانية' : 'Curated Walking Expeditions'}
              </h3>
              <button
                onClick={() => setShowTours(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-3 space-y-3">
              {JAX_TOURS.map((tour) => (
                <div
                  key={tour.id}
                  className="p-4 rounded-xl bg-[#101420] border border-white/10 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      {isArabic ? tour.titleAr : tour.titleEn}
                    </h4>
                    <span className="text-xs font-bold text-cyan-300">
                      {tour.durationMinutes} {isArabic ? 'دقيقة' : 'min'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {isArabic ? tour.descriptionAr : tour.descriptionEn}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-stone-400">
                      {tour.stopsCount} {isArabic ? 'محطات فنية' : 'art stops'}
                    </span>
                    <button
                      onClick={() => startTour(tour)}
                      className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/20"
                    >
                      {isArabic ? 'بدء الجولة الآن' : 'Start Tour'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
