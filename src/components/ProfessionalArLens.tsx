import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Compass,
  MapPin,
  CheckCircle2,
  Navigation,
  Info,
  Clock,
  Sparkles,
  RotateCw,
  Layers,
  ChevronDown
} from 'lucide-react';
import { JaxDistrictSite, JAX_REAL_SITES } from '../data/jaxRealLocations';
import { GpsTelemetry, computeDistanceMeters, computeBearingDegrees, formatCoordinates } from '../services/geolocationService';

interface ProfessionalArLensProps {
  gpsTelemetry: GpsTelemetry | null;
  activeSite: JaxDistrictSite;
  onSelectSite: (site: JaxDistrictSite) => void;
  isArabic: boolean;
  onOpenSiteDetails: (site: JaxDistrictSite) => void;
}

export const ProfessionalArLens: React.FC<ProfessionalArLensProps> = ({
  gpsTelemetry,
  activeSite,
  onSelectSite,
  isArabic,
  onOpenSiteDetails
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [deviceHeading, setDeviceHeading] = useState<number>(activeSite.bearingDeg);
  const [manualHeadingOffset, setManualHeadingOffset] = useState<number>(0);

  // Snapshot flash state
  const [snapshotFlash, setSnapshotFlash] = useState<boolean>(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  // Compute live distance from real GPS telemetry
  const liveCalculatedDistance = gpsTelemetry
    ? computeDistanceMeters(
        gpsTelemetry.latitude,
        gpsTelemetry.longitude,
        activeSite.lat,
        activeSite.lng
      )
    : null;

  // Determine if the user is physically within the immediate zone of the site (<= 15 meters)
  const isDirectlyAtSite = liveCalculatedDistance !== null ? liveCalculatedDistance <= 15 : false;

  // Calculate live bearing from GPS if available
  const liveBearing = gpsTelemetry
    ? computeBearingDegrees(
        gpsTelemetry.latitude,
        gpsTelemetry.longitude,
        activeSite.lat,
        activeSite.lng
      )
    : activeSite.bearingDeg;

  // Total heading
  const currentHeading = ((deviceHeading + manualHeadingOffset) % 360 + 360) % 360;

  // Start Physical Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
          setHasCameraPermission(true);
        })
        .catch((err) => {
          console.warn('Physical camera stream unavailable:', err);
          setHasCameraPermission(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Listen to Device Orientation (Supporting Android Chrome absolute orientation)
  useEffect(() => {
    const handleOrientation = (e: any) => {
      let heading: number | null = null;
      if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        heading = (360 - e.alpha) % 360;
      }
      if (heading !== null) {
        setDeviceHeading(Math.round(heading));
      }
    };

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
  }, []);

  // Calibrate heading to target site bearing
  const handleCalibrateHeading = () => {
    setManualHeadingOffset(liveBearing - deviceHeading);
  };

  // Capture Field Snapshot with Geodetic Survey Stamp
  const captureFieldPhoto = () => {
    setSnapshotFlash(true);
    setTimeout(() => setSnapshotFlash(false), 120);

    const offscreen = document.createElement('canvas');
    offscreen.width = 1920;
    offscreen.height = 1080;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    if (videoRef.current && hasCameraPermission) {
      ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
    } else {
      const img = new Image();
      img.src = activeSite.image;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
        stampSurveyMetadata(ctx, offscreen);
      };
      return;
    }

    stampSurveyMetadata(ctx, offscreen);
  };

  const stampSurveyMetadata = (ctx: CanvasRenderingContext2D, offscreen: HTMLCanvasElement) => {
    // Professional Survey Box
    ctx.fillStyle = 'rgba(10, 14, 22, 0.92)';
    ctx.fillRect(40, offscreen.height - 180, 880, 130);

    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(40, offscreen.height - 180, 6, 130);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px "Plus Jakarta Sans", Tajawal, sans-serif';
    ctx.fillText(`${activeSite.code} · ${activeSite.titleAr}`, 65, offscreen.height - 130);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 18px "Plus Jakarta Sans", monospace, sans-serif';
    const coordsStr = gpsTelemetry
      ? formatCoordinates(gpsTelemetry.latitude, gpsTelemetry.longitude)
      : formatCoordinates(activeSite.lat, activeSite.lng);
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    ctx.fillText(
      `JAX DISTRICT DIRIYAH | GPS: ${coordsStr} | ${dateStr} UTC`,
      65,
      offscreen.height - 90
    );

    const dataUrl = offscreen.toDataURL('image/jpeg', 0.95);
    setCapturedPhotoUrl(dataUrl);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#05070c] font-sans text-stone-100"
    >
      {/* 1. Real Camera Feed */}
      {hasCameraPermission ? (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : (
        <div className="absolute inset-0 z-0">
          <img
            src={activeSite.image}
            alt={activeSite.titleAr}
            className="w-full h-full object-cover brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </div>
      )}

      {/* 2. Top Telemetry Bar: Real GPS Satellites, Accuracy & Azimuth (Clean & Professional) */}
      <div className="absolute top-3 inset-x-3 max-w-xl mx-auto z-20 pointer-events-auto">
        <div className="bg-[#090d16]/95 backdrop-blur-xl border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl flex items-center justify-between text-xs">
          {/* Coordinates & Accuracy */}
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-300 font-semibold text-[11px]">
                  {gpsTelemetry
                    ? formatCoordinates(gpsTelemetry.latitude, gpsTelemetry.longitude)
                    : `${activeSite.lat.toFixed(4)}° N, ${activeSite.lng.toFixed(4)}° E`}
                </span>
                <span className="text-[10px] text-stone-400 px-1.5 py-0.2 rounded bg-white/5 border border-white/10">
                  {gpsTelemetry ? `±${Math.round(gpsTelemetry.accuracy)}m` : isArabic ? 'GPS متصل' : 'GPS Active'}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {isArabic ? 'حي جاكس للفنون · الدرعية' : 'JAX District · Diriyah'}
              </p>
            </div>
          </div>

          {/* Compass Azimuth & One-Tap Calibrate */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCalibrateHeading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 text-[11px] font-mono transition border border-white/10"
              title={isArabic ? 'معايرة البوصلة مع الموقع' : 'Calibrate Azimuth'}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentHeading}°</span>
              <RotateCw className="w-3 h-3 text-stone-400 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Central Precision Reticle (Ultra Clean & Minimalist - NO cartoonish shapes) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-8">
        <div
          className={`relative w-64 h-64 md:w-72 md:h-72 rounded-2xl border transition-all duration-300 ${
            isDirectlyAtSite
              ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.35)] bg-emerald-400/5'
              : 'border-white/20'
          }`}
        >
          {/* Subtle Corner Markers */}
          <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 ${isDirectlyAtSite ? 'border-emerald-400' : 'border-white/50'}`} />
          <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 ${isDirectlyAtSite ? 'border-emerald-400' : 'border-white/50'}`} />
          <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 ${isDirectlyAtSite ? 'border-emerald-400' : 'border-white/50'}`} />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 ${isDirectlyAtSite ? 'border-emerald-400' : 'border-white/50'}`} />

          {/* Center Crosshair Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                isDirectlyAtSite
                  ? 'bg-emerald-400 shadow-[0_0_10px_#34D399] scale-125'
                  : 'bg-cyan-400 shadow-[0_0_6px_#00F0FF]'
              }`}
            />
          </div>

          {/* Verification Status Header */}
          <div className="absolute -top-10 inset-x-0 flex justify-center">
            {isDirectlyAtSite ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/70 text-xs font-bold text-emerald-200 shadow-xl backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? `أنت في الموقع: ${activeSite.code}` : `At Site: ${activeSite.code}`}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0e18]/90 border border-white/15 text-[11px] text-stone-300 shadow-xl backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeSite.code}</span>
                <span className="text-stone-400 font-mono">
                  {liveCalculatedDistance !== null ? `${liveCalculatedDistance}m` : `${activeSite.bearingDeg}°`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Field Status & Navigation Card (Professional & High-Contrast) */}
      <div className="absolute bottom-20 inset-x-3 max-w-xl mx-auto z-20 pointer-events-auto">
        <div className="p-4 rounded-2xl bg-[#0a0e18]/95 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col gap-3">
          {/* Main Info Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <img
                src={activeSite.image}
                alt={activeSite.titleAr}
                className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs">
                    {activeSite.code}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {isArabic ? activeSite.typeAr : activeSite.typeEn}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                  {isArabic ? activeSite.titleAr : activeSite.titleEn}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isArabic ? activeSite.primaryExhibitionAr : activeSite.primaryExhibitionEn}
                </p>
              </div>
            </div>

            {/* Distance / Arrival Badge */}
            <div className="text-right shrink-0">
              {isDirectlyAtSite ? (
                <div className="flex flex-col items-end">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-xs">
                    {isArabic ? 'في الموقع' : 'At Location'}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">0m</span>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="font-mono font-bold text-sm text-cyan-400">
                    {liveCalculatedDistance !== null ? `${liveCalculatedDistance}m` : '—'}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    {isArabic ? 'المسافة الحقيقية' : 'True Distance'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            {/* View Details */}
            <button
              onClick={() => onOpenSiteDetails(activeSite)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-bold transition border border-white/10"
            >
              <Info className="w-3.5 h-3.5 text-stone-400" />
              <span>{isArabic ? 'بيانات الموقع والمعرض' : 'Site Dossier'}</span>
            </button>

            {/* Shutter Capture Button with GPS watermark */}
            <button
              onClick={captureFieldPhoto}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md shadow-cyan-400/25 active:scale-95 shrink-0"
              title={isArabic ? 'توثيق الموقع بالصورة والـ GPS' : 'Stamp Photo'}
            >
              <Camera className="w-4 h-4" />
              <span>{isArabic ? 'توثيق' : 'Capture'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Flash */}
      {snapshotFlash && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-ping duration-150" />
      )}

      {/* Captured Photo Download Modal */}
      {capturedPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0a0e18] border border-cyan-400/50 rounded-2xl max-w-lg w-full p-5 text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-sm font-bold text-white">
                {isArabic ? 'الصورة الموثقة بإحداثيات الـ GPS' : 'Documented Photo with GPS Telemetry'}
              </h4>
              <button
                onClick={() => setCapturedPhotoUrl(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black">
              <img src={capturedPhotoUrl} alt="Captured" className="w-full h-auto" />
            </div>

            <div className="flex gap-2">
              <a
                href={capturedPhotoUrl}
                download={`JAX_${activeSite.code}_${Date.now()}.jpg`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-stone-950 font-bold text-xs transition shadow-md"
              >
                <span>{isArabic ? 'حفظ الصورة في الهاتف' : 'Download Photo'}</span>
              </a>
              <button
                onClick={() => setCapturedPhotoUrl(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-stone-300 text-xs font-bold hover:bg-white/15"
              >
                {isArabic ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
