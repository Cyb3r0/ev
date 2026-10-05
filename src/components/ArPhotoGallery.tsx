import React from 'react';
import { X, Download, Trash2, Camera } from 'lucide-react';

export interface SavedSnapshot {
  id: string;
  dataUrl: string;
  artworkTitle: string;
  artist: string;
  dateStr: string;
}

interface ArPhotoGalleryProps {
  snapshots: SavedSnapshot[];
  onDeleteSnapshot: (id: string) => void;
  isArabic: boolean;
  onClose: () => void;
}

export const ArPhotoGallery: React.FC<ArPhotoGalleryProps> = ({
  snapshots,
  onDeleteSnapshot,
  isArabic,
  onClose
}) => {
  const handleDownload = (snap: SavedSnapshot) => {
    const a = document.createElement('a');
    a.href = snap.dataUrl;
    a.download = `JAX_AR_${snap.artworkTitle.replace(/\s+/g, '_')}_${snap.id}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b0e17] border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 text-stone-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-xl font-black text-white">
              {isArabic ? 'معرض صور الواقع المعزز (AR)' : 'JAX AR Captured Memories'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {snapshots.length} {isArabic ? 'صور موثقة في حي جاكس' : 'captured snapshots'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto my-4 pr-1">
          {snapshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-stone-400">
              <Camera className="w-12 h-12 stroke-[1.2] text-stone-500 mb-2" />
              <p className="text-sm font-semibold">
                {isArabic ? 'لم تلتقط أي صور AR حتى الآن' : 'No AR snapshots captured yet'}
              </p>
              <p className="text-xs text-stone-500 mt-1 text-center max-w-sm">
                {isArabic
                  ? 'انقر على زر الكاميرا الفضي/السيان لتوثيق زيارتك وحفظ اللقطة فوراً.'
                  : 'Tap the shutter button while exploring sculptures to capture memories with official JAX stamps.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="rounded-xl overflow-hidden bg-[#121622] border border-white/10 shadow-lg group relative"
                >
                  <img
                    src={snap.dataUrl}
                    alt={snap.artworkTitle}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-white truncate">{snap.artworkTitle}</h4>
                    <p className="text-[11px] text-stone-400 truncate">{snap.artist}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">{snap.dateStr}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleDownload(snap)}
                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تحميل' : 'Download'}</span>
                      </button>

                      <button
                        onClick={() => onDeleteSnapshot(snap.id)}
                        className="text-stone-400 hover:text-red-400 transition p-1"
                        title={isArabic ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
