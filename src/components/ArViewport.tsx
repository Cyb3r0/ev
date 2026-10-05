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
  Zap
} from 'lucide-react';
import { Artwork, HangarLocation } from '../data/jaxData';

interface ArViewportProps {
  artwork: Artwork;
  hangars: HangarLocation[];
  isSimulatedCamera: boolean;
  isPowerSaving?: boolean;
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
  const [recognizedObject, setRecognizedObject] = useState<Artwork | null>(artwork);

  // Throttling timestamp for orientation updates
  const lastOrientationUpdateRef = useRef<number>(0);

  // Manual touch pan dragging
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);

  // Total calculated heading combining sensor + manual drag adjustment
  const currentHeading = ((deviceHeading + manualHeadingOffset) % 360 + 360) % 360;

  // Angular delta between target physical bearing and camera heading
  const rawDiff = artwork.compassBearingDeg - currentHeading;
  const deltaBearing = ((rawDiff + 540) % 360) - 180; // Range: -180 to +180 deg
  const isAligned = Math.abs(deltaBearing) <= 14;
  const turnLeft = deltaBearing < -14;
  const turnRight = deltaBearing > 14;

  // Real Camera stream setup with power-saving frame-rate optimization
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

  // Sync recognized artwork when user picks another
  useEffect(() => {
    setRecognizedObject(artwork);
  }, [artwork.id]);

  // Real Device orientation / Gyroscope listener with dynamic refresh rate throttling
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const now = performance.now();
      // Throttle refresh rate to 15 FPS (~66ms) in power-saving mode vs 60 FPS (~16ms) in normal mode
      const minIntervalMs = isPowerSaving ? 66 : 16;
      if (now - lastOrientationUpdateRef.current < minIntervalMs) return;
      lastOrientationUpdateRef.current = now;

      if (e.alpha !== null) {
        setDeviceHeading(Math.round(e.alpha));
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isPowerSaving]);

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

  // Real-time scan simulation trigger
  const runVisionScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setRecognizedObject(artwork);
    }, 1200);
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

      {/* 4. Directional Edge Glow Indicators */}
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

      {/* 5. Directional Chevron Indicators */}
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
            isAligned
              ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)] bg-cyan-400/5'
              : 'border-cyan-400/20'
          }`}
        >
          {/* Corner Brackets */}
          <div
            className={`absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 transition-colors ${
              isAligned ? 'border-cyan-300' : 'border-cyan-400'
            }`}
          />
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 transition-colors ${
              isAligned ? 'border-cyan-300' : 'border-cyan-400'
            }`}
          />
          <div
            className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 transition-colors ${
              isAligned ? 'border-cyan-300' : 'border-cyan-400'
            }`}
          />
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 transition-colors ${
              isAligned ? 'border-cyan-300' : 'border-cyan-400'
            }`}
          />

          {/* Center Crosshair Target */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                isAligned
                  ? 'border-cyan-300 scale-110 shadow-[0_0_15px_#00F0FF] bg-cyan-400/20'
                  : 'border-cyan-400/30'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  isAligned ? 'bg-white shadow-[0_0_10px_#00F0FF]' : 'bg-cyan-400'
                }`}
              />
            </div>
          </div>

          {/* Active Scan Line (disabled in power-saving mode) */}
          {isScanning && !isPowerSaving && (
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00F0FF] animate-scan" />
          )}

          {/* Target Alignment & Status Badge */}
          <div className="absolute -top-10 inset-x-0 flex justify-center">
            {isAligned ? (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-xs font-bold text-cyan-200 backdrop-blur-md ${
                  isPowerSaving ? '' : 'animate-pulse'
                }`}
              >
                <Target className="w-4 h-4 text-cyan-300" />
                <span>
                  {isArabic
                    ? `تمت المحاذاة: ${artwork.titleAr} (${Math.round(artwork.compassBearingDeg)}°)`
                    : `Aligned: ${artwork.titleEn} (${Math.round(artwork.compassBearingDeg)}°)`}
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
      <div className="absolute top-24 inset-x-4 max-w-lg mx-auto z-20 pointer-events-auto">
        <div className="bg-[#090c14]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isAligned
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
                <span className="font-mono text-cyan-400 font-bold text-xs">
                  {artwork.initialDistanceMeters}m
                </span>
                {isAligned && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 rounded">
                    {isArabic ? 'في مجال الرؤية' : 'In View'}
                  </span>
                )}
                {isPowerSaving && (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    <Zap className="w-2.5 h-2.5" />
                    <span>15 FPS</span>
                  </span>
                )}
              </div>
              <p className="text-white font-medium text-xs mt-0.5 leading-snug">
                {isArabic ? artwork.walkingDirectionAr : artwork.walkingDirectionEn}
              </p>
            </div>
          </div>

          {/* Quick Scan Button */}
          <button
            onClick={runVisionScan}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-[11px] transition shadow-md shadow-cyan-400/20 shrink-0"
            title={isArabic ? 'إعادة فحص المعلم' : 'Scan Landmark'}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مسح' : 'Scan'}</span>
          </button>
        </div>
      </div>

      {/* 8. Real Ground Path Stepping Markers */}
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
    </div>
  );
};
