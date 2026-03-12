'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Navigation, Wifi, AlertCircle } from 'lucide-react';

interface LocationPermissionBannerProps {
  locationStatus: 'detecting' | 'granted' | 'denied' | 'idle';
  locationSource?: string | null;
  onRequestLocation: () => void;
}

const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  locationStatus,
  locationSource,
  onRequestLocation,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  const isDenied = locationStatus === 'denied';
  const isIP     = locationStatus === 'granted' && locationSource === 'ip';
  const shouldShow = !dismissed && (isDenied || isIP);

  const handleClick = async () => {
    if (isDenied) {
      // Kalau denied, browser tidak akan munculin prompt lagi
      // Tampilkan panduan manual cara ubah setting
      setShowManualGuide(v => !v);
      return;
    }

    // Kalau IP — coba minta ulang GPS permission
    setIsRequesting(true);
    onRequestLocation();
    // Reset loading state setelah 5 detik (GPS biasanya selesai atau timeout)
    setTimeout(() => setIsRequesting(false), 5_000);
  };

  // Detect browser untuk panduan spesifik
  const getBrowserGuide = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      return [
        'Klik ikon 🔒 atau ℹ️ di sebelah kiri address bar',
        'Pilih "Izin situs" atau "Site settings"',
        'Cari "Lokasi" → ubah ke "Izinkan"',
        'Refresh halaman ini',
      ];
    }
    if (ua.includes('Firefox')) {
      return [
        'Klik ikon 🔒 di address bar',
        'Klik tanda panah di sebelah "Izin"',
        'Cari "Akses lokasi Anda" → pilih "Izinkan"',
        'Refresh halaman ini',
      ];
    }
    if (ua.includes('Safari')) {
      return [
        'Buka Pengaturan → Safari → Lokasi',
        'Ubah ke "Izinkan"',
        'Refresh halaman ini',
      ];
    }
    if (ua.includes('Edg')) {
      return [
        'Klik ikon 🔒 di address bar',
        'Pilih "Izin untuk situs ini"',
        'Lokasi → "Izinkan"',
        'Refresh halaman ini',
      ];
    }
    return [
      'Buka pengaturan browser kamu',
      'Cari izin lokasi untuk situs ini',
      'Ubah ke "Izinkan"',
      'Refresh halaman ini',
    ];
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5"
        >
          <div className={`relative backdrop-blur-xl rounded-2xl border overflow-hidden ${
            isDenied
              ? 'bg-orange-500/15 border-orange-400/30'
              : 'bg-blue-500/15 border-blue-400/30'
          }`}>
            {/* Main row */}
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isDenied ? 'bg-orange-500/20' : 'bg-blue-500/20'
              }`}>
                {isDenied
                  ? <AlertCircle className="w-4 h-4 text-orange-400" />
                  : isIP
                  ? <Wifi className="w-4 h-4 text-blue-400" />
                  : <MapPin className="w-4 h-4 text-blue-400" />
                }
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">
                  {isDenied ? 'Izin lokasi diblokir' : 'Lokasi kurang akurat (via IP)'}
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {isDenied
                    ? 'Klik "Cara Aktifkan" untuk panduan mengizinkan lokasi di browser kamu.'
                    : 'Klik "Izinkan GPS" agar cuaca yang tampil sesuai lokasi kamu saat ini.'}
                </p>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleClick}
                disabled={isRequesting}
                className={`flex items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 shadow-lg disabled:opacity-60 ${
                  isDenied
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                    : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                }`}
              >
                {isRequesting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>{isDenied ? 'Cara Aktifkan' : isRequesting ? 'Mendeteksi...' : 'Izinkan GPS'}</span>
              </motion.button>

              {/* Dismiss */}
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/30 hover:text-white/60 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Manual guide (expand kalau denied) */}
            <AnimatePresence>
              {showManualGuide && isDenied && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-orange-400/20 px-5 py-4"
                >
                  <p className="text-[10px] font-black text-orange-300/70 uppercase tracking-widest mb-3">
                    Cara mengaktifkan lokasi
                  </p>
                  <ol className="space-y-2">
                    {getBrowserGuide().map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-xs text-white/60">{step}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationPermissionBanner;