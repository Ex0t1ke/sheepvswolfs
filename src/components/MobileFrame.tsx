import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 overflow-x-hidden select-none">
      {/* Top Desktop bar with Phone Frame Toggle */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[480px] mb-2 px-2 text-xs text-neutral-400">
        <span className="font-bold flex items-center gap-1.5 text-neutral-300">
          <span>🐑</span> Защита Овец от Волков • Mobile 2D
        </span>
        <button
          onClick={() => setDeviceFrameMode(!deviceFrameMode)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 hover:text-white transition-colors"
          title="Переключить рамку смартфона"
        >
          {deviceFrameMode ? (
            <>
              <Monitor size={14} />
              <span>Без рамки</span>
            </>
          ) : (
            <>
              <Smartphone size={14} />
              <span>Рамка смартфона</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrameMode
            ? 'sm:max-w-[440px] sm:rounded-[44px] sm:border-[10px] sm:border-neutral-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_#262626] sm:ring-1 sm:ring-white/10'
            : 'max-w-xl rounded-2xl border border-neutral-800'
        } bg-[#1a2e16] min-h-screen sm:min-h-[760px] sm:max-h-[920px] flex flex-col justify-between overflow-hidden relative`}
      >
        {/* Mobile Camera Notch / Dynamic Island on desktop frame */}
        {deviceFrameMode && (
          <div className="hidden sm:flex justify-center w-full absolute top-2 left-0 right-0 z-40 pointer-events-none">
            <div className="w-28 h-4 bg-neutral-900 rounded-full border border-neutral-700/60 shadow-inner flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-950 border border-indigo-800" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col pt-1 sm:pt-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
