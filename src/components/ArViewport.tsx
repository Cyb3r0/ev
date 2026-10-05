import React, { useEffect, useRef, useState } from 'react';
import {
  Scan,
  Compass,
  Navigation,
  CheckCircle2,
  Volume2,
  Info,
  Footprints,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  MapPin,
  Check,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { Artwork, HangarLocation } from '../data/jaxData';

interface ArViewportProps {
  artwork: Artwork;
  hangars: HangarLocation[];
  isSimulatedCamera: boolean;
  isPowerSaving?: boolean;
  realGpsDistance?: number | null;
  onSnapshotReady: (dataUrl: string) => void;
  triggerSnapshot: boolean;
  onSnapshotCaptured: () => void;
  onOpenDossier: () => void;
  onOpenAudio: () => void;
  isArabic: boolean;
}

export const ArViewport: React.FC<ArViewportProps> = ({
  artwork,
  hangars,
  isSimulatedCamera,
  isPowerSaving = false,
  realGpsDistance = null,
  onSnapshotReady,
  triggerSnapshot,
  onSnapshotCaptured,
  onOpenDossier,
  onOpenAudio,
  isArabic
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [deviceHeading, setDeviceHeading] = useState<number>(35);
  const [manualHeadingOffset, setManualHeadingOffset] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Manual arrival confirmation override (when user is standing in front of the artwork)
  const [isConfirmedAtLocation, setIsConfirmedAtLocation] = useState<boolean>(false);
  const [showRecognitionModal, setShowRecognitionModal] = useState<boolean>(false);

  // Throttling timestamp for orientation updates
  const lastOrientationUpdateRef = useRef<number>(0);

  // Manual touch pan dragging
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);

  // Compute effective distance: if user confirmed or GPS is <= 5m, distance is 0
  const effectiveDistance = isConfirmedAtLocation
    ? 0
    : realGpsDistance !== null && realGpsDistance <= 500
    ? realGpsDistance
    : artwork.initialDistanceMeters;

  const isUserAtArtwork = isConfirmedAtLocation || (realGpsDistance !== null && realGpsDistance <= 6);

  // Total calculated heading combining sensor + manual drag adjustment
  const currentHeading = ((deviceHeading + manualHeadingOffset) % 360 + 360) % 360;

  // Angular delta between target physical bearing and camera heading
  const rawDiff = artwork.compassBearingDeg - currentHeading;
  const deltaBearing = ((rawDiff + 540) % 360) - 180; // Range: -180 to +180 deg

  // If user is at artwork, treat as aligned immediately!
  const isAligned = isUserAtArtwork || Math.abs(deltaBearing) <= 18;
  const turnLeft = !isUserAtArtwork && deltaBearing < -18;
  const turnRight = !isUserAtArtwork && deltaBearing > 18;

  // Reset confirmation when switching artwork
  useEffect(() => {
    setIsConfirmedAtLocation(false);
    setShowRecognitionModal(false);
  }, [artwork.id]);

  // Real Camera stream setup
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (!isSimulatedCamera && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: isPowerSaving ? 1280 : 1920 },
          height: { ideal: isPowerSaving ? 720 : 1080 },
          frameRate: { ideal: isPowerSaving ? 15 : 30, max: isPowerSaving ? 15 : 60 }
        },
        audio: false
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
          setHasCameraPermission(true);
        })
        .catch((err) => {
          console.warn('Physical camera unavailable, using simulated JAX live feed:', err);
          setHasCameraPermission(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isSimulatedCamera, isPowerSaving]);

  // Enhanced Device Orientation Listener (Supports Android Chrome deviceorientationabsolute)
  useEffect(() => {
    const handleOrientation = (e: any) => {
      const now = performance.now();
      const minIntervalMs = isPowerSaving ? 66 : 16;
      if (now - lastOrientationUpdateRef.current < minIntervalMs) return;
      lastOrientationUpdateRef.current = now;

      let heading: number | null = null;
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // Standard compass heading on Android Chrome:
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null) {
        setDeviceHeading(Math.round(heading));
      }
    };

    // Standard Android Chrome absolute orientation
    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleOrientation);
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isPowerSaving]);

  // One-tap compass calibration & instant alignment
  const calibrateHeadingToTarget = () => {
    // Offset manual heading so deltaBearing becomes 0
    setManualHeadingOffset(artwork.compassBearingDeg - deviceHeading);
  };

  // Instant Arrival Confirmation (for when user is standing right in front of the artwork)
  const confirmArrivalAtArtwork = () => {
    setIsConfirmedAtLocation(true);
    calibrateHeadingToTarget();
    setShowRecognitionModal(true);
  };

  // Touch drag to manually calibrate / rotate heading
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const diffX = e.clientX - startXRef.current;
    startXRef.current = e.clientX;
    setManualHeadingOffset((prev) => (prev - diffX * 0.35) % 360);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Visual scan trigger
  const runVisionScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      confirmArrivalAtArtwork();
    }, 1000);
  };

  // Real photo snapshot compositing
  useEffect(() => {
    if (!triggerSnapshot) return;

    const composeSnapshot = () => {
      const container = containerRef.current;
      if (!container) return;

      const offscreen = document.createElement('canvas');
      offscreen.width = 1920;
      offscreen.height = 1080;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      if (!isSimulatedCamera && videoRef.current && hasCameraPermission) {
        ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
      } else {
        const img = new Image();
        img.src = artwork.image;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
          finalizeWatermark(ctx, offscreen);
        };
        return;
      }

      finalizeWatermark(ctx, offscreen);
    };

    const finalizeWatermark = (ctx: CanvasRenderingContext2D, offscreen: HTMLCanvasElement) => {
      ctx.fillStyle = 'rgba(7, 9, 15, 0.9)';
      ctx.fillRect(48, offscreen.height - 180, 820, 120);

      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(48, offscreen.height - 180, 6, 120);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px "Plus Jakarta Sans", Tajawal, sans-serif';
      ctx.fillText(`${artwork.titleAr} · ${artwork.artistAr}`, 75, offscreen.height - 125);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        `JAX ARTS DISTRICT · DIRIYAH | ${artwork.hangarCode} | ${new Date().toLocaleDateString('ar-SA')}`,
        75,
        offscreen.height - 85
      );

      const dataUrl = offscreen.toDataURL('image/jpeg', 0.94);
      onSnapshotReady(dataUrl);
      onSnapshotCaptured();
    };

    composeSnapshot();
  }, [triggerSnapshot, artwork.id, isSimulatedCamera, hasCameraPermission]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full overflow-hidden select-none touch-none bg-[#07090e] transition-all duration-500 ${
        isPowerSaving ? 'brightness-75 contrast-95' : 'brightness-100 contrast-100'
      }`}
    >
      {/* 1. Real WebRTC Camera Feed */}
      {!isSimulatedCamera && (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* 2. Authentic Photographic JAX District View */}
      {isSimulatedCamera && (
        <div className="absolute inset-0 z-0">
          <img
            src={artwork.image}
            alt={artwork.titleAr}
            className="w-full h-full object-cover brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </div>
      )}

      {/* 3. AMOLED Power-Saving Vignette Overlay */}
      {isPowerSaving && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/50" />
      )}

      {/* 4. Directional Edge Glow Indicators (Disabled once user arrived!) */}
      {turnLeft && (
        <div
          className={`absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cyan-400/25 via-cyan-400/10 to-transparent pointer-events-none z-20 ${
            isPowerSaving ? 'opacity-70' : 'animate-pulse'
          }`}
        />
      )}
      {turnRight && (
        <div
          className={`absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-cyan-400/25 via-cyan-400/10 to-transparent pointer-events-none z-20 ${
            isPowerSaving ? 'opacity-70' : 'animate-pulse'
          }`}
        />
      )}

      {/* 5. Directional Chevron Indicators (Hidden if arrived or aligned) */}
      {turnLeft && (
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center gap-1.5 ${
            isPowerSaving ? '' : 'animate-bounce'
          }`}
        >
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#090d16]/90 backdrop-blur-xl border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.35)] text-cyan-300">
            <ChevronLeft className="w-5 h-5 text-cyan-400" />
            <div className="text-right">
              <span className="block text-xs font-bold leading-tight">
                {isArabic ? 'انعطف يساراً' : 'Turn Left'}
              </span>
              <span className="block text-[10px] font-mono text-cyan-200">
                {Math.abs(Math.round(deltaBearing))}°
              </span>
            </div>
          </div>
        </div>
      )}

      {turnRight && (
        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center gap-1.5 ${
            isPowerSaving ? '' : 'animate-bounce'
          }`}
        >
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#090d16]/90 backdrop-blur-xl border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.35)] text-cyan-300">
            <div className="text-left">
              <span className="block text-xs font-bold leading-tight">
                {isArabic ? 'انعطف يميناً' : 'Turn Right'}
              </span>
              <span className="block text-[10px] font-mono text-cyan-200">
                {Math.round(deltaBearing)}°
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      )}

      {/* 6. AR Scanner Reticle & Computer Vision Brackets */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-8">
        <div
          className={`relative w-72 h-72 md:w-80 md:h-80 rounded-2xl border transition-all duration-300 ${
            isUserAtArtwork
              ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.5)] bg-emerald-400/10'
              : isAligned
              ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)] bg-cyan-400/5'
              : 'border-cyan-400/20'
          }`}
        >
          {/* Corner Brackets */}
          <div
            className={`absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 transition-colors ${
              isUserAtArtwork ? 'border-emerald-400' : isAligned ? 'border-cyan-300' : 'border-cyan-400'
            }`}
          />
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 transition-colors ${
              isUserAtArtwork ? 'border-emerald-400' : isAligned ? 'border-cyan-300' : 'border-cyan-400'
            }`}
          />
          <div
            className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 transition-colors ${
              isUserAtArtwork ? 'border-emerald-400' : isAligned ? 'border-cyan-300' : 'border-cyan-400'
            }`}
          />
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 transition-colors ${
              isUserAtArtwork ? 'border-emerald-400' : isAligned ? 'border-cyan-300' : 'border-cyan-400'
            }`}
          />

          {/* Center Crosshair Target */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                isUserAtArtwork
                  ? 'border-emerald-300 scale-110 shadow-[0_0_20px_#34D399] bg-emerald-400/25'
                  : isAligned
                  ? 'border-cyan-300 scale-110 shadow-[0_0_15px_#00F0FF] bg-cyan-400/20'
                  : 'border-cyan-400/30'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isUserAtArtwork
                    ? 'bg-emerald-300 shadow-[0_0_12px_#34D399]'
                    : isAligned
                    ? 'bg-white shadow-[0_0_10px_#00F0FF]'
                    : 'bg-cyan-400'
                }`}
              />
            </div>
          </div>

          {/* Active Scan Line */}
          {isScanning && (
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00F0FF] animate-scan" />
          )}

          {/* Target Alignment & Status Badge */}
          <div className="absolute -top-11 inset-x-0 flex justify-center">
            {isUserAtArtwork ? (
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-xs font-bold text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.4)] backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {isArabic
                    ? `أنت في الموقع: ${artwork.titleAr}`
                    : `At Location: ${artwork.titleEn}`}
                </span>
                <span className="text-emerald-300 font-mono">0m</span>
              </div>
            ) : isAligned ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-xs font-bold text-cyan-200 backdrop-blur-md">
                <Target className="w-4 h-4 text-cyan-300" />
                <span>
                  {isArabic
                    ? `تمت المحاذاة: ${artwork.titleAr}`
                    : `Aligned: ${artwork.titleEn}`}
                </span>
                <span className="text-cyan-400 font-mono">LOCKED</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0d16]/90 border border-cyan-500/40 text-[11px] text-cyan-300 shadow-xl backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold">
                  {isArabic ? `الموقع المطلوب: ${artwork.hangarCode}` : `Target: ${artwork.hangarCode}`}
                </span>
                <span className="text-stone-400 font-mono">{Math.round(artwork.compassBearingDeg)}°</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7. Real AR Walking Navigation Ribbon Overlaid on Camera */}
      <div className="absolute top-20 inset-x-3 max-w-lg mx-auto z-20 pointer-events-auto">
        <div className="bg-[#090c14]/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isUserAtArtwork
                    ? 'bg-emerald-400 text-stone-950 shadow-[0_0_15px_#34D399]'
                    : isAligned
                    ? 'bg-cyan-400 text-stone-950 shadow-[0_0_15px_#00F0FF]'
                    : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-400'
                }`}
              >
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                    {artwork.hangarCode}
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      isUserAtArtwork ? 'text-emerald-400' : 'text-cyan-400'
                    }`}
                  >
                    {effectiveDistance}m
                  </span>
                  {isUserAtArtwork && (
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-1.5 rounded">
                      {isArabic ? 'تم الوصول!' : 'Arrived!'}
                    </span>
                  )}
                </div>
                <p className="text-white font-medium text-xs mt-0.5 leading-snug">
                  {isUserAtArtwork
                    ? isArabic
                      ? 'أنت أمام العمل الفني مباشرة، انقر على فحص أو استمع للشرح الصوتي'
                      : 'You are directly at the artwork location'
                    : isArabic
                    ? artwork.walkingDirectionAr
                    : artwork.walkingDirectionEn}
                </p>
              </div>
            </div>

            {/* Quick Scan Button */}
            <button
              onClick={runVisionScan}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-[11px] transition shadow-md shadow-cyan-400/20 shrink-0"
              title={isArabic ? 'فحص ومسح المعلم' : 'Scan Landmark'}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{isArabic ? 'مسح' : 'Scan'}</span>
            </button>
          </div>

          {/* Quick Arrival & Compass Calibration Strip (Crucial for on-site visitors!) */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[11px]">
            {/* "I Am in front of the artwork right now" button */}
            <button
              onClick={confirmArrivalAtArtwork}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-bold transition ${
                isUserAtArtwork
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                  : 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 hover:bg-cyan-500/30'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isArabic
                  ? isUserAtArtwork
                    ? '✅ مؤكد: أنا في الموقع'
                    : '📍 أنا أمام العمل الآن (تأكيد)'
                  : '📍 I am here now'}
              </span>
            </button>

            {/* "Align Compass" calibration button */}
            <button
              onClick={calibrateHeadingToTarget}
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-300 text-[11px] transition border border-white/10 shrink-0"
              title={isArabic ? 'معايرة البوصلة مع المعلم' : 'Align Compass'}
            >
              <RotateCw className="w-3 h-3 text-cyan-400" />
              <span>{isArabic ? 'معايرة' : 'Align'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8. Real Ground Path Stepping Markers (Hidden when arrived) */}
      {!isUserAtArtwork && (
        <div className="absolute bottom-40 inset-x-0 z-10 pointer-events-none flex justify-center">
          <div
            className={`flex flex-col items-center gap-3 opacity-80 ${
              isPowerSaving ? 'opacity-60' : 'animate-pulse'
            }`}
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] text-cyan-300 font-bold backdrop-blur-md">
              <Footprints className="w-3 h-3 text-cyan-400" />
              <span>{isArabic ? 'مسار المشي الميداني' : 'Walking Path'}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
            <div className="w-3 h-3 rounded-full bg-cyan-400/60" />
            <div className="w-4 h-4 rounded-full bg-cyan-400/30" />
          </div>
        </div>
      )}

      {/* 9. ON-SITE RECOGNITION CONFIRMATION POPUP (Triggered on arrival or Scan) */}
      {showRecognitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b0e18] border border-cyan-400/80 rounded-2xl max-w-sm w-full p-5 text-stone-100 shadow-[0_0_35px_rgba(0,240,255,0.3)] animate-in fade-in zoom-in-95">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isArabic ? 'تم التحقق من المعلم الميداني' : 'Landmark Verified'}</span>
              </div>
              <button
                onClick={() => setShowRecognitionModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Artwork Photo & Info */}
            <div className="my-3 flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-white/5">
              <img
                src={artwork.image}
                alt={artwork.titleAr}
                className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                  {artwork.hangarCode}
                </span>
                <h4 className="text-xs font-bold text-white truncate mt-1">
                  {isArabic ? artwork.titleAr : artwork.titleEn}
                </h4>
                <p className="text-[11px] text-stone-400 truncate">
                  {isArabic ? artwork.artistAr : artwork.artistEn}
                </p>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {isArabic ? 'المسافة: 0 متر (في الموقع)' : 'Distance: 0m (Here)'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed line-clamp-3 mb-4">
              {isArabic ? artwork.curatorialEssayAr : artwork.curatorialEssayEn}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowRecognitionModal(false);
                  onOpenAudio();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/20"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isArabic ? 'تشغيل المرشد الصوتي للعمل 🎧' : 'Play Audio Guide'}</span>
              </button>

              <button
                onClick={() => {
                  setShowRecognitionModal(false);
                  onOpenDossier();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold transition"
              >
                <Info className="w-3.5 h-3.5 text-stone-400" />
                <span>{isArabic ? 'قراءة الملف النقدي الكامل' : 'View Full Dossier'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
