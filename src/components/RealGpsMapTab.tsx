import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  Locate,
  ExternalLink,
  Download,
  Wifi,
  WifiOff,
  HardDrive,
  RefreshCw,
  Trash2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { JaxDistrictSite, JAX_REAL_SITES } from '../data/jaxRealLocations';
import { GpsTelemetry, computeDistanceMeters, formatCoordinates } from '../services/geolocationService';
import { MapCacheService, MapCacheMetadata } from '../services/mapCacheService';

interface RealGpsMapTabProps {
  gpsTelemetry: GpsTelemetry | null;
  sites: JaxDistrictSite[];
  selectedSiteId: string;
  onSelectSite: (site: JaxDistrictSite) => void;
  isArabic: boolean;
}

export const RealGpsMapTab: React.FC<RealGpsMapTabProps> = ({
  gpsTelemetry,
  sites,
  selectedSiteId,
  onSelectSite,
  isArabic
}) => {
  const [activeSite, setActiveSite] = useState<JaxDistrictSite>(
    sites.find((s) => s.id === selectedSiteId) || sites[0]
  );

  // Network Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedIndoorHangar, setIsSimulatedIndoorHangar] = useState<boolean>(false);

  // Offline Map Cache State
  const [cacheMeta, setCacheMeta] = useState<MapCacheMetadata>(MapCacheService.getCacheMetadata());
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStepText, setDownloadStepText] = useState<string>('');
  const [showCachePanel, setShowCachePanel] = useState<boolean>(false);

  // Monitor Network Connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-precache map tiles on first launch if not cached yet
    if (!MapCacheService.isMapCached()) {
      MapCacheService.downloadAndCacheTiles().then(() => {
        setCacheMeta(MapCacheService.getCacheMetadata());
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute live distance to active selected site
  const liveDist = gpsTelemetry
    ? computeDistanceMeters(
        gpsTelemetry.latitude,
        gpsTelemetry.longitude,
        activeSite.lat,
        activeSite.lng
      )
    : null;

  // Effective connection status (real or simulated for indoor hangar testing)
  const effectiveOnline = isOnline && !isSimulatedIndoorHangar;

  // Trigger manual cache download
  const handleDownloadTiles = async () => {
    setIsDownloading(true);
    setDownloadProgress(10);
    setDownloadStepText(isArabic ? 'بدء فحص حزم البلاطات والطبقات...' : 'Initializing tile bundles...');

    const success = await MapCacheService.downloadAndCacheTiles((percent, text) => {
      setDownloadProgress(percent);
      setDownloadStepText(text);
    });

    if (success) {
      setCacheMeta(MapCacheService.getCacheMetadata());
    }
    setTimeout(() => {
      setIsDownloading(false);
    }, 600);
  };

  // Clear cache
  const handleClearCache = async () => {
    await MapCacheService.clearCache();
    setCacheMeta(MapCacheService.getCacheMetadata());
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6 pb-28 text-stone-100 bg-[#06080e]">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white">
                {isArabic ? 'خريطة مواقع حي جاكس الميدانية' : 'JAX District Ground Survey Map'}
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 font-mono">
              {gpsTelemetry
                ? `GPS LIVE: ${formatCoordinates(gpsTelemetry.latitude, gpsTelemetry.longitude)} (±${Math.round(gpsTelemetry.accuracy)}m)`
                : isArabic ? 'جاري استقبال إشارة الأقمار الصناعية GPS...' : 'Acquiring satellite lock...'}
            </p>
          </div>

          {/* Connection & Offline Cache Status Pills */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Network connectivity pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                effectiveOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border-amber-400/50 text-amber-300'
              }`}
            >
              {effectiveOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] hidden xs:inline">{isArabic ? 'متصل' : 'Online'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold">
                    {isArabic ? 'دون اتصال (هنجر)' : 'Offline (Hangar)'}
                  </span>
                </>
              )}
            </div>

            {/* Offline Cache Toggle / Settings Button */}
            <button
              onClick={() => setShowCachePanel(!showCachePanel)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition ${
                cacheMeta.isCached
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/25'
                  : 'bg-white/5 border-white/10 text-stone-300 hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">
                {cacheMeta.isCached
                  ? `${cacheMeta.sizeMb} MB ${isArabic ? 'مخزن' : 'Cached'}`
                  : isArabic ? 'حفظ محلي' : 'Offline'}
              </span>
            </button>
          </div>
        </div>

        {/* Offline Notice Banner when inside a shielded hangar */}
        {!effectiveOnline && (
          <div className="rounded-xl bg-amber-500/15 border border-amber-500/40 p-3 flex items-start gap-2.5 text-amber-200 text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">
                {isArabic
                  ? 'نمط العمل دون اتصال نشط (داخل الهنجر)'
                  : 'Offline Mode Active (Inside Hangar)'}
              </span>
              <p className="text-[11px] text-amber-300/90 mt-0.5">
                {isArabic
                  ? 'يتم عرض المخطط الهندسي وبيانات الهناجر من الذاكرة المحلية المخزنة؛ ومستشعر الـ GPS يعمل بدقة تامة عبر الأقمار الصناعية مباشرة.'
                  : 'Displaying architectural blueprints and hangar telemetry from persistent local storage. Native GPS operates via direct satellite lock.'}
              </p>
            </div>
          </div>
        )}

        {/* Offline Cache Management Drawer (Expandable) */}
        {showCachePanel && (
          <div className="p-4 rounded-2xl bg-[#0a0e18] border border-cyan-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">
                  {isArabic ? 'حزمة الخرائط المخزنة محلياً (Offline Map Cache)' : 'Local Map Tile Cache'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">
                {cacheMeta.isCached
                  ? `${cacheMeta.sizeMb} MB · ${cacheMeta.tileCount} ${isArabic ? 'طبقة وبلاطة' : 'tiles'}`
                  : isArabic ? 'غير مخزنة' : 'Not Cached'}
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {isArabic
                ? 'تقوم هذه الميزة بتحميل وتخزين كافة بلاطات الخريطة والمخططات الهندسية في ذاكرة المتصفح الدائمة (Cache Storage)، لتستمر الخريطة في العمل بدقة وسلاسة كاملة عندما تضعف شبكة الجوال داخل الهناجر الحديدية المسقوفة.'
                : 'Pre-caches district vector tiles and architectural maps locally in browser storage so the map remains responsive even inside metal hangars with weak cell signals.'}
            </p>

            {/* Download Progress Bar */}
            {isDownloading && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="truncate pr-2">{downloadStepText}</span>
                  <span className="font-mono text-cyan-400 font-bold">{downloadProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cache Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTiles}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition disabled:opacity-50 shadow-md shadow-cyan-400/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {cacheMeta.isCached
                      ? isArabic ? 'تحديث الحزمة المخزنة' : 'Update Cache'
                      : isArabic ? 'تحميل الخريطة محلياً الآن' : 'Download Offline Map'}
                  </span>
                </button>

                {cacheMeta.isCached && (
                  <button
                    onClick={handleClearCache}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-stone-400 hover:text-red-400 text-xs transition border border-white/10"
                    title={isArabic ? 'مسح الحزمة' : 'Clear Cache'}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isArabic ? 'مسح' : 'Clear'}</span>
                  </button>
                )}
              </div>

              {/* Hangar Offline Simulation Switch for quick real-world testing */}
              <button
                onClick={() => setIsSimulatedIndoorHangar(!isSimulatedIndoorHangar)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition ${
                  isSimulatedIndoorHangar
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
                }`}
                title={isArabic ? 'اختبار عمل الخريطة دون إنترنت داخل الهنجر' : 'Test Offline Mode'}
              >
                <WifiOff className="w-3 h-3" />
                <span>
                  {isSimulatedIndoorHangar
                    ? isArabic ? 'محاكاة: داخل الهنجر (Offline)' : 'Indoor Hangar Sim: ON'
                    : isArabic ? 'اختبار وضع الهنجر' : 'Test Hangar Offline'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Real Architectural Map Graphic with Offline Local Vector Engine */}
        <div className="relative w-full h-72 md:h-80 rounded-2xl bg-[#080b13] border border-white/15 overflow-hidden shadow-2xl flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 1000 600">
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1000" height="600" fill="url(#grid)" />

            {/* Wadi Hanifa Riverbed Buffer */}
            <path
              d="M 50,0 Q 140,250 80,450 T 130,600 L 0,600 L 0,0 Z"
              fill="rgba(14, 116, 144, 0.18)"
              stroke="rgba(6, 182, 212, 0.35)"
              strokeWidth="2"
            />
            <text x="35" y="320" fill="#22D3EE" fontSize="13" fontWeight="bold" opacity="0.7">
              {isArabic ? 'وادي حنيفة التاريخي' : 'Wadi Hanifa Valley'}
            </text>

            {/* Main Central Boulevard */}
            <line x1="280" y1="40" x2="800" y2="540" stroke="#171c2a" strokeWidth="48" strokeLinecap="round" />
            <line x1="280" y1="40" x2="800" y2="540" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="10 10" opacity="0.3" />

            {/* Cross Avenues */}
            <line x1="240" y1="180" x2="520" y2="100" stroke="#121622" strokeWidth="22" strokeLinecap="round" />
            <line x1="420" y1="430" x2="860" y2="300" stroke="#121622" strokeWidth="22" strokeLinecap="round" />

            {/* Plotting Sites */}
            {sites.map((site) => {
              const normX = Math.min(Math.max((site.lng - 46.5730) / 0.0032, 0.05), 0.95);
              const normY = Math.min(Math.max(1 - (site.lat - 24.7410) / 0.0042, 0.05), 0.95);
              const cx = normX * 900 + 50;
              const cy = normY * 500 + 50;

              const isSelected = site.id === activeSite.id;
              const dist = gpsTelemetry
                ? computeDistanceMeters(gpsTelemetry.latitude, gpsTelemetry.longitude, site.lat, site.lng)
                : null;

              return (
                <g
                  key={site.id}
                  onClick={() => setActiveSite(site)}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <rect
                    x={cx - 50}
                    y={cy - 28}
                    width="100"
                    height="56"
                    rx="10"
                    fill={isSelected ? 'rgba(0, 240, 255, 0.25)' : '#0e121d'}
                    stroke={isSelected ? '#00F0FF' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isSelected ? '2.5' : '1.2'}
                  />
                  <text
                    x={cx}
                    y={cy - 4}
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : '#e2e8f0'}
                    fontSize="13"
                    fontWeight="bold"
                  >
                    {site.code}
                  </text>
                  <text
                    x={cx}
                    y={cy + 16}
                    textAnchor="middle"
                    fill={isSelected ? '#00F0FF' : '#94a3b8'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {dist !== null ? `${dist}m` : `${site.bearingDeg}°`}
                  </text>
                </g>
              );
            })}

            {/* User Real GPS Blue Dot Position (Operates independently of network connectivity via GNSS satellites) */}
            {gpsTelemetry && (
              <g>
                {(() => {
                  const uNormX = Math.min(Math.max((gpsTelemetry.longitude - 46.5730) / 0.0032, 0.05), 0.95);
                  const uNormY = Math.min(Math.max(1 - (gpsTelemetry.latitude - 24.7410) / 0.0042, 0.05), 0.95);
                  const ux = uNormX * 900 + 50;
                  const uy = uNormY * 500 + 50;
                  return (
                    <>
                      <circle cx={ux} cy={uy} r="22" fill="rgba(52, 211, 153, 0.2)" className="animate-ping" />
                      <circle cx={ux} cy={uy} r="7" fill="#34D399" stroke="#ffffff" strokeWidth="2.5" />
                      <text x={ux + 12} y={uy + 4} fill="#34D399" fontSize="12" fontWeight="bold">
                        {isArabic ? 'موقعك الفعلي (GPS)' : 'Your GPS Position'}
                      </text>
                    </>
                  );
                })()}
              </g>
            )}
          </svg>

          {/* Compass Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 border border-white/15 text-xs font-mono text-cyan-300">
            <Compass className="w-3.5 h-3.5" />
            <span>NORTH 0°</span>
          </div>

          {/* Offline Cached Watermark on Map Canvas */}
          {cacheMeta.isCached && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded bg-black/75 border border-white/10 text-[10px] font-mono text-stone-400">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              <span>OFFLINE TILE ENGINE V1</span>
            </div>
          )}
        </div>

        {/* Selected Site Detail Card */}
        <div className="p-4 rounded-2xl bg-[#0c101b] border border-white/15 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <img
              src={activeSite.image}
              alt={activeSite.titleAr}
              className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-400/30">
                  {activeSite.code}
                </span>
                <span className="text-xs text-stone-400">
                  {isArabic ? activeSite.typeAr : activeSite.typeEn}
                </span>
                {liveDist !== null && (
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {liveDist <= 15 ? (isArabic ? 'أنت في الموقع!' : 'At Location!') : `${liveDist}m`}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white mt-1">
                {isArabic ? activeSite.titleAr : activeSite.titleEn}
              </h3>

              <p className="text-xs text-stone-400 mt-0.5">
                {isArabic ? activeSite.primaryExhibitionAr : activeSite.primaryExhibitionEn}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectSite(activeSite)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-lg shadow-cyan-400/20 shrink-0"
          >
            <Navigation className="w-4 h-4" />
            <span>{isArabic ? 'فتح في عدسة الكاميرا' : 'View in AR Camera'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
