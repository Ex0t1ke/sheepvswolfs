import React from 'react';

/**
 * Cute fluffy sheep component with animated chewing/breathing
 */
export const SheepSprite: React.FC<{
  size?: number;
  isSafe?: boolean;
  isScared?: boolean;
  className?: string;
}> = ({ size = 48, isSafe = false, isScared = false, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none transition-transform duration-300 ${
        isScared ? 'animate-bounce' : 'hover:scale-105'
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="filter drop-shadow-md overflow-visible"
      >
        <defs>
          <radialGradient id="sheepWool" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f4f4f0" />
            <stop offset="100%" stopColor="#e5e5dc" />
          </radialGradient>
          <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c2826" />
            <stop offset="100%" stopColor="#1a1816" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="50" cy="85" rx="34" ry="10" fill="#000000" opacity="0.25" />

        {/* Legs */}
        <rect x="30" y="70" width="7" height="18" rx="3.5" fill="#1c1917" />
        <rect x="42" y="72" width="7" height="17" rx="3.5" fill="#1c1917" />
        <rect x="54" y="72" width="7" height="17" rx="3.5" fill="#1c1917" />
        <rect x="66" y="70" width="7" height="18" rx="3.5" fill="#1c1917" />
        {/* Hooves */}
        <rect x="30" y="84" width="7" height="4" rx="2" fill="#44403c" />
        <rect x="42" y="85" width="7" height="4" rx="2" fill="#44403c" />
        <rect x="54" y="85" width="7" height="4" rx="2" fill="#44403c" />
        <rect x="66" y="84" width="7" height="4" rx="2" fill="#44403c" />

        {/* Fluffy Wool Puffs (Body) */}
        <g fill="url(#sheepWool)">
          <circle cx="34" cy="46" r="17" />
          <circle cx="50" cy="40" r="19" />
          <circle cx="68" cy="46" r="17" />
          <circle cx="75" cy="58" r="16" />
          <circle cx="64" cy="68" r="17" />
          <circle cx="48" cy="70" r="18" />
          <circle cx="32" cy="66" r="17" />
          <circle cx="23" cy="55" r="15" />
          <circle cx="50" cy="55" r="22" />
        </g>

        {/* Black Face */}
        <ellipse cx="32" cy="52" rx="14" ry="17" fill="url(#faceGrad)" />

        {/* Ears */}
        <ellipse cx="19" cy="45" rx="7" ry="4" transform="rotate(-25 19 45)" fill="#292524" />
        <ellipse cx="43" cy="44" rx="7" ry="4" transform="rotate(25 43 44)" fill="#292524" />

        {/* Wool tuft on forehead */}
        <circle cx="32" cy="38" r="7" fill="#ffffff" />
        <circle cx="27" cy="40" r="5" fill="#f4f4f0" />
        <circle cx="37" cy="40" r="5" fill="#f4f4f0" />

        {/* Cute Eyes */}
        {isScared ? (
          <>
            <circle cx="27" cy="49" r="4.5" fill="#ffffff" />
            <circle cx="27" cy="49" r="2.5" fill="#000000" />
            <circle cx="36" cy="49" r="4.5" fill="#ffffff" />
            <circle cx="36" cy="49" r="2.5" fill="#000000" />
          </>
        ) : (
          <>
            <ellipse cx="27" cy="50" rx="3.5" ry="4" fill="#ffffff" />
            <circle cx="26.5" cy="50" r="2.2" fill="#0c0a09" />
            <circle cx="28" cy="48.5" r="1" fill="#ffffff" />

            <ellipse cx="36" cy="50" rx="3.5" ry="4" fill="#ffffff" />
            <circle cx="35.5" cy="50" r="2.2" fill="#0c0a09" />
            <circle cx="37" cy="48.5" r="1" fill="#ffffff" />
          </>
        )}

        {/* Pink cheeks */}
        <ellipse cx="23" cy="56" rx="3.5" ry="2.2" fill="#f472b6" opacity="0.6" />
        <ellipse cx="40" cy="56" rx="3.5" ry="2.2" fill="#f472b6" opacity="0.6" />

        {/* Snout / smile */}
        <path d="M 30 59 Q 32 61 34 59" stroke="#78716c" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Safe badge / halo if safe */}
        {isSafe && (
          <path
            d="M 50 15 L 53 22 L 60 22 L 55 27 L 57 34 L 50 30 L 43 34 L 45 27 L 40 22 L 47 22 Z"
            fill="#eab308"
            stroke="#ca8a04"
            strokeWidth="1"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
};

/**
 * Fierce but stylized cartoon Wolf component
 */
export const WolfSprite: React.FC<{
  size?: number;
  facing?: 'left' | 'right' | 'up' | 'down';
  isConfused?: boolean;
  className?: string;
}> = ({ size = 48, facing = 'up', isConfused = false, className = '' }) => {
  const rotation =
    facing === 'right' ? 'rotate-90' : facing === 'down' ? 'rotate-180' : facing === 'left' ? '-rotate-90' : 'rotate-0';

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none transition-all duration-200 ${className}`}
    >
      <div className={`w-full h-full transform transition-transform duration-200 ${rotation}`}>
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="filter drop-shadow-lg overflow-visible"
        >
          <defs>
            <linearGradient id="wolfFur" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="wolfBelly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="50" cy="55" rx="26" ry="34" fill="#000000" opacity="0.3" />

          {/* Bushy Tail */}
          <path
            d="M 50 82 Q 62 95 56 100 Q 42 96 46 82 Z"
            fill="url(#wolfFur)"
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Paws (back) */}
          <ellipse cx="30" cy="74" rx="7" ry="10" fill="#1e293b" />
          <ellipse cx="70" cy="74" rx="7" ry="10" fill="#1e293b" />

          {/* Main Body */}
          <ellipse cx="50" cy="52" rx="22" ry="28" fill="url(#wolfFur)" stroke="#0f172a" strokeWidth="1.5" />
          <ellipse cx="50" cy="54" rx="14" ry="18" fill="url(#wolfBelly)" />

          {/* Paws (front) */}
          <ellipse cx="28" cy="38" rx="6.5" ry="9" fill="#1e293b" />
          <ellipse cx="72" cy="38" rx="6.5" ry="9" fill="#1e293b" />

          {/* Head */}
          <ellipse cx="50" cy="28" rx="18" ry="16" fill="url(#wolfFur)" stroke="#0f172a" strokeWidth="1.5" />

          {/* Ears */}
          <polygon points="36,18 42,4 47,19" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
          <polygon points="38,17 42,8 45,18" fill="#f43f5e" opacity="0.75" />

          <polygon points="64,18 58,4 53,19" fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
          <polygon points="62,17 58,8 55,18" fill="#f43f5e" opacity="0.75" />

          {/* Snout */}
          <polygon points="44,28 50,14 56,28" fill="#1e293b" />
          {/* Black Nose */}
          <ellipse cx="50" cy="16" rx="3.5" ry="2.5" fill="#020617" />

          {/* Glowing Amber Eyes */}
          <ellipse cx="42" cy="25" rx="3.5" ry="4" transform="rotate(-15 42 25)" fill="#facc15" />
          <circle cx="42" cy="25" r="1.8" fill="#000000" />
          <circle cx="43" cy="24" r="0.8" fill="#ffffff" />

          <ellipse cx="58" cy="25" rx="3.5" ry="4" transform="rotate(15 58 25)" fill="#facc15" />
          <circle cx="58" cy="25" r="1.8" fill="#000000" />
          <circle cx="59" cy="24" r="0.8" fill="#ffffff" />

          {/* White Fangs */}
          <polygon points="46,29 48,34 50,29" fill="#f8fafc" />
          <polygon points="50,29 52,34 54,29" fill="#f8fafc" />
        </svg>
      </div>

      {/* Confused / Baffled badge over wolf */}
      {isConfused && (
        <div className="absolute -top-3 -right-2 bg-amber-500 text-neutral-900 font-extrabold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce z-10">
          ?
        </div>
      )}
    </div>
  );
};

/**
 * Natural Tree Stump / Stone Obstacle
 */
export const ObstacleSprite: React.FC<{ size?: number; type?: 'stump' | 'rock' }> = ({
  size = 40,
  type = 'stump',
}) => {
  if (type === 'rock') {
    return (
      <svg viewBox="0 0 60 60" width={size} height={size} className="drop-shadow-md">
        <ellipse cx="30" cy="50" rx="22" ry="8" fill="#000000" opacity="0.3" />
        <path
          d="M 12 44 C 10 32, 18 16, 32 14 C 44 12, 50 24, 48 38 C 47 48, 42 50, 26 50 Z"
          fill="#64748b"
          stroke="#334155"
          strokeWidth="2"
        />
        {/* Moss highlight */}
        <path d="M 18 28 Q 25 18 36 20 Q 30 26 22 28 Z" fill="#84cc16" opacity="0.8" />
        <circle cx="36" cy="32" r="3" fill="#475569" />
      </svg>
    );
  }

  // Wood Stump
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} className="drop-shadow-md">
      <ellipse cx="30" cy="50" rx="22" ry="8" fill="#000000" opacity="0.3" />
      {/* Bark Base */}
      <path
        d="M 14 36 L 12 50 C 14 54, 46 54, 48 50 L 46 36 Z"
        fill="#78350f"
        stroke="#451a03"
        strokeWidth="2"
      />
      {/* Bark Vert lines */}
      <line x1="22" y1="38" x2="20" y2="51" stroke="#451a03" strokeWidth="1.5" />
      <line x1="32" y1="39" x2="33" y2="52" stroke="#451a03" strokeWidth="1.5" />
      <line x1="40" y1="38" x2="41" y2="50" stroke="#451a03" strokeWidth="1.5" />

      {/* Cut top surface */}
      <ellipse cx="30" cy="35" rx="17" ry="10" fill="#d97706" stroke="#451a03" strokeWidth="2" />
      {/* Tree Rings */}
      <ellipse cx="30" cy="35" rx="12" ry="7" fill="none" stroke="#92400e" strokeWidth="1.2" />
      <ellipse cx="30" cy="35" rx="6" ry="3.5" fill="none" stroke="#92400e" strokeWidth="1.2" />
      <circle cx="30" cy="35" r="1.5" fill="#451a03" />

      {/* Small green leaf sprout */}
      <path d="M 42 34 Q 48 26 50 30 Q 48 36 43 35 Z" fill="#22c55e" />
    </svg>
  );
};

/**
 * Wooden Fence Segment (Horizontal or Vertical)
 */
export const WoodenFenceSprite: React.FC<{
  orientation: 'h' | 'v';
  length?: number;
  thickness?: number;
  preview?: boolean;
}> = ({ orientation, length = 60, thickness = 14, preview = false }) => {
  const isH = orientation === 'h';

  if (preview) {
    return (
      <div
        style={{
          width: isH ? length : thickness,
          height: isH ? thickness : length,
        }}
        className="rounded bg-amber-400/40 border-2 border-dashed border-amber-300 pointer-events-none animate-pulse"
      />
    );
  }

  return (
    <div
      style={{
        width: isH ? length : thickness,
        height: isH ? thickness : length,
      }}
      className="relative flex items-center justify-center filter drop-shadow-md"
    >
      <svg
        viewBox={isH ? '0 0 100 24' : '0 0 24 100'}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={isH ? 'hFenceWood' : 'vFenceWood'} x1="0" y1="0" x2={isH ? 0 : 1} y2={isH ? 1 : 0}>
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>

        {isH ? (
          <g>
            {/* Upper Rail */}
            <rect x="2" y="2" width="96" height="8" rx="2" fill="url(#hFenceWood)" stroke="#451a03" strokeWidth="1" />
            {/* Lower Rail */}
            <rect x="2" y="14" width="96" height="8" rx="2" fill="url(#hFenceWood)" stroke="#451a03" strokeWidth="1" />
            {/* Posts / Ties */}
            <rect x="18" y="0" width="6" height="24" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1" />
            <rect x="47" y="0" width="6" height="24" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1" />
            <rect x="76" y="0" width="6" height="24" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1" />
            {/* Nails / Rivets */}
            <circle cx="21" cy="6" r="1" fill="#1c1917" />
            <circle cx="21" cy="18" r="1" fill="#1c1917" />
            <circle cx="50" cy="6" r="1" fill="#1c1917" />
            <circle cx="50" cy="18" r="1" fill="#1c1917" />
            <circle cx="79" cy="6" r="1" fill="#1c1917" />
            <circle cx="79" cy="18" r="1" fill="#1c1917" />
          </g>
        ) : (
          <g>
            {/* Left Rail */}
            <rect x="2" y="2" width="8" height="96" rx="2" fill="url(#vFenceWood)" stroke="#451a03" strokeWidth="1" />
            {/* Right Rail */}
            <rect x="14" y="2" width="8" height="96" rx="2" fill="url(#vFenceWood)" stroke="#451a03" strokeWidth="1" />
            {/* Cross Ties */}
            <rect x="0" y="18" width="24" height="6" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1" />
            <rect x="0" y="47" width="24" height="6" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1" />
            <rect x="0" y="76" width="24" height="6" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1" />
            {/* Nails */}
            <circle cx="6" cy="21" r="1" fill="#1c1917" />
            <circle cx="18" cy="21" r="1" fill="#1c1917" />
            <circle cx="6" cy="50" r="1" fill="#1c1917" />
            <circle cx="18" cy="50" r="1" fill="#1c1917" />
            <circle cx="6" cy="79" r="1" fill="#1c1917" />
            <circle cx="18" cy="79" r="1" fill="#1c1917" />
          </g>
        )}
      </svg>
    </div>
  );
};
