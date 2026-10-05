import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  Calendar,
  Layers,
  Globe,
  Radio,
  ExternalLink,
  ShieldAlert,
  Info,
  WifiOff
} from 'lucide-react';
import { JAX_REAL_SITES, JAX_REAL_EVENTS, JaxDistrictSite } from './data/jaxRealLocations';
import { GpsTelemetry, computeDistanceMeters, formatCoordinates } from './services/geolocationService';
import { ProfessionalArLens } from './components/ProfessionalArLens';
import { RealGpsMapTab } from './components/RealGpsMapTab';
import { DirectoryTab } from './components/DirectoryTab';
import { OfficialScheduleTab } from './components/OfficialScheduleTab';
import { SiteDetailsModal } from './components/SiteDetailsModal';

type AppTab = 'lens' | 'map' | 'directory' | 'schedule';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('lens');
  const [isArabic, setIsArabic] = useState<boolean>(true);
  const [activeSite, setActiveSite] = useState<JaxDistrictSite>(JAX_REAL_SITES[0]); // Default to JAX 12 Sculpture Garden

  // Network Online/Offline state
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Real-Time GPS Telemetry State
  const [gpsTelemetry, setGpsTelemetry] = useState<GpsTelemetry | null>(null);
  const [gpsPermissionError, setGpsPermissionError] = useState<string | null>(null);

  // Modal State
  const [inspectedSite, setInspectedSite] = useState<JaxDistrictSite | null>(null);

  // Sync HTML Document Language & Direction
  useEffect(() => {
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [isArabic]);

  // Network Connectivity Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time GPS Geolocation Tracker (Hardware GNSS operates independently of cellular/Wi-Fi)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGpsPermissionError('مستشعر الموقع الجغرافي GPS غير مدعوم في هذا المتصفح');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsPermissionError(null);
        const telemetry: GpsTelemetry = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp
        };
        setGpsTelemetry(telemetry);

        // Find nearest site automatically based on real GPS coordinates
        let nearestSite = JAX_REAL_SITES[0];
        let shortestDist = Infinity;

        JAX_REAL_SITES.forEach((site) => {
          const d = computeDistanceMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            site.lat,
            site.lng
          );
          if (d < shortestDist) {
            shortestDist = d;
            nearestSite = site;
          }
        });

        // Automatically focus on nearest site if user is within JAX (e.g. within 250m)
        if (shortestDist <= 250) {
          setActiveSite(nearestSite);
        }
      },
      (err) => {
        console.warn('GPS position error:', err.message);
        if (err.code === 1) {
          setGpsPermissionError(
            isArabic
              ? 'يرجى السماح بالوصول إلى الموقع الجغرافي (GPS) لحساب المسافات الحقيقية'
              : 'Please enable location permissions for true GPS tracking'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 1000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isArabic]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070c] font-sans text-stone-100 flex flex-col select-none">
      {/* 1. Professional Header Toolbar */}
      <header className="w-full z-30 px-3.5 py-3 flex items-center justify-between bg-[#080b13]/95 backdrop-blur-xl border-b border-white/10 shrink-0">
        {/* Brand & District Title */}
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40">
            <span className="font-black text-cyan-400 text-xs tracking-wider">JAX</span>
          </div>
          <div>
            <h1 className="text-xs font-bold text-white leading-tight">
              {isArabic ? 'حي جاكس للفنون · الدرعية' : 'JAX Arts District · Diriyah'}
            </h1>
            <p className="text-[10px] text-stone-400">
              {isArabic ? 'نظام الملاحة والرصد الميداني' : 'Field Navigation & Site Survey'}
            </p>
          </div>
        </div>

        {/* Telemetry Status & Language Controls */}
        <div className="flex items-center gap-2">
          {/* Offline Indicator when inside a shielded hangar */}
          {!isOnline && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-mono">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>{isArabic ? 'هنجر / دون اتصال' : 'Offline'}</span>
            </div>
          )}

          {/* GPS Live Telemetry Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition ${
              gpsTelemetry
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <Radio
              className={`w-3 h-3 ${gpsTelemetry ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}
            />
            <span className="text-[10px]">
              {gpsTelemetry
                ? `GPS ±${Math.round(gpsTelemetry.accuracy)}m`
                : isArabic
                ? 'GPS متصل'
                : 'Acquiring GPS'}
            </span>
          </div>

          {/* Bilingual Switcher */}
          <button
            onClick={() => setIsArabic(!isArabic)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-stone-200 text-xs font-bold transition hover:bg-white/10"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>{isArabic ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </header>

      {/* GPS Permission Warning Notification (if user disabled browser location) */}
      {gpsPermissionError && (
        <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-3.5 py-2 flex items-center justify-between text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] leading-tight">{gpsPermissionError}</span>
          </div>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(() => {}, () => {});
              }
            }}
            className="px-2.5 py-1 rounded bg-amber-400 text-stone-950 font-bold text-[10px] shrink-0 hover:bg-amber-300"
          >
            {isArabic ? 'تفعيل' : 'Enable'}
          </button>
        </div>
      )}

      {/* 2. Main Content Area */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* TAB 1: Professional AR Field Lens */}
        {activeTab === 'lens' && (
          <ProfessionalArLens
            gpsTelemetry={gpsTelemetry}
            activeSite={activeSite}
            onSelectSite={(site) => setActiveSite(site)}
            isArabic={isArabic}
            onOpenSiteDetails={(site) => setInspectedSite(site)}
          />
        )}

        {/* TAB 2: Real GPS District Map with Offline Caching Layer */}
        {activeTab === 'map' && (
          <RealGpsMapTab
            gpsTelemetry={gpsTelemetry}
            sites={JAX_REAL_SITES}
            selectedSiteId={activeSite.id}
            onSelectSite={(site) => {
              setActiveSite(site);
              setActiveTab('lens');
            }}
            isArabic={isArabic}
          />
        )}

        {/* TAB 3: Pavilions & Sites Directory (Sorted by true GPS distance) */}
        {activeTab === 'directory' && (
          <DirectoryTab
            gpsTelemetry={gpsTelemetry}
            sites={JAX_REAL_SITES}
            selectedSiteId={activeSite.id}
            onSelectSite={(site) => {
              setActiveSite(site);
              setActiveTab('lens');
            }}
            onOpenDetails={(site) => setInspectedSite(site)}
            isArabic={isArabic}
          />
        )}

        {/* TAB 4: Official Exhibitions & Events Schedule */}
        {activeTab === 'schedule' && (
          <OfficialScheduleTab
            events={JAX_REAL_EVENTS}
            sites={JAX_REAL_SITES}
            onSelectSiteInLens={(site) => {
              setActiveSite(site);
              setActiveTab('lens');
            }}
            isArabic={isArabic}
          />
        )}
      </main>

      {/* 3. Professional Bottom Navigation Bar */}
      <nav className="w-full z-40 bg-[#070a11] border-t border-white/10 px-3 py-2 flex items-center justify-around shrink-0 shadow-2xl">
        {/* Tab 1: Lens */}
        <button
          onClick={() => setActiveTab('lens')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'lens'
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {isArabic ? 'العدسة الميدانية' : 'Field Lens'}
          </span>
        </button>

        {/* Tab 2: Map */}
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
            {isArabic ? 'الخريطة الحية' : 'GPS Map'}
          </span>
        </button>

        {/* Tab 3: Directory */}
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'directory'
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {isArabic ? 'سجل المواقع' : 'Directory'}
          </span>
        </button>

        {/* Tab 4: Schedule */}
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'schedule'
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {isArabic ? 'الفعاليات' : 'Schedule'}
          </span>
        </button>
      </nav>

      {/* 4. Inspected Site Details Modal */}
      {inspectedSite && (
        <SiteDetailsModal
          site={inspectedSite}
          isArabic={isArabic}
          onClose={() => setInspectedSite(null)}
          onSelectInLens={(site) => {
            setActiveSite(site);
            setActiveTab('lens');
            setInspectedSite(null);
          }}
        />
      )}
    </div>
  );
}
