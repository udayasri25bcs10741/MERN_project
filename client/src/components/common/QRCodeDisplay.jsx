import React, { useState } from 'react';
import { QrCode, Key, Eye, EyeOff } from 'lucide-react';

export default function QRCodeDisplay({ code, title = 'Handover QR Code' }) {
  const [showQr, setShowQr] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(code)}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => setShowQr(!showQr)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-full transition-all"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{showQr ? 'Show Pickup Text' : 'Show Handover QR Code'}</span>
        </button>
      </div>

      {showQr && (
        <div className="p-4 bg-white rounded-2xl border border-surface-200 shadow-sm flex flex-col items-center justify-center animate-fade-in space-y-2">
          <div className="p-2 bg-white rounded-xl border border-surface-100 shadow-inner">
            <img
              src={qrUrl}
              alt={`QR Code for ${code}`}
              className="w-44 h-44 object-contain"
              loading="lazy"
            />
          </div>
          <p className="text-[11px] font-medium text-surface-500">
            Courier can scan this code to complete pickup instantly
          </p>
        </div>
      )}
    </div>
  );
}
