import React from 'react';
import { GameStep } from '../types';
import { Settings, Play, RotateCcw, HelpCircle, FastForward, Lightbulb } from 'lucide-react';
import { SheepSprite } from './GameIcons';

interface GameHUDProps {
  levelId: number;
  sheepCount: number;
  placedSheepCount: number;
  totalWolves: number;
  availableFences: number;
  totalFences: number;
  gameStep: GameStep;
  onStartSimulation: () => void;
  onResetFences: () => void;
  onOpenSettings: () => void;
  onToggleHint: () => void;
  showHint: boolean;
  simulationSpeed: number;
  onToggleSpeed: () => void;
  onSelectSheepToPlace?: () => void;
}

export const TopBar: React.FC<{
  levelId: number;
  sheepCount: number;
  placedSheepCount: number;
  wolfCount: number;
  availableFences: number;
  onOpenSettings: () => void;
  onToggleHint: () => void;
  showHint: boolean;
}> = ({
  levelId,
  sheepCount,
  placedSheepCount,
  wolfCount,
  availableFences,
  onOpenSettings,
  onToggleHint,
  showHint,
}) => {
  return (
    <div className="w-full max-w-[440px] mx-auto px-4 py-2 flex items-center justify-between bg-neutral-800/80 backdrop-blur border-b border-neutral-700/60 rounded-b-xl shadow-lg mb-2 select-none">
      {/* Level Title */}
      <div className="flex items-center gap-1.5">
        <span className="font-extrabold text-sm sm:text-base text-amber-400 tracking-wide">
          Уровень {levelId}
        </span>
      </div>

      {/* Counters: Sheep, Wolves, Fences (Matching Screenshot) */}
      <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
        {/* Sheep Counter */}
        <div className="flex items-center gap-1 bg-neutral-900/60 px-2 py-1 rounded-lg border border-neutral-700/60">
          <div className="w-4 h-4 flex items-center justify-center">
            <SheepSprite size={16} />
          </div>
          <span className="text-white">
            {placedSheepCount}/{sheepCount}
          </span>
        </div>

        {/* Wolf Counter */}
        <div className="flex items-center gap-1 bg-neutral-900/60 px-2 py-1 rounded-lg border border-neutral-700/60">
          <span className="text-sm">🐺</span>
          <span className="text-rose-400">{wolfCount}</span>
        </div>

        {/* Fence Counter */}
        <div className="flex items-center gap-1 bg-neutral-900/60 px-2 py-1 rounded-lg border border-neutral-700/60">
          <span className="text-amber-500 font-extrabold text-sm">🚪</span>
          <span className={availableFences > 0 ? 'text-amber-400' : 'text-neutral-400'}>
            {availableFences}
          </span>
        </div>
      </div>

      {/* Actions: Hint & Settings */}
      <div className="flex items-center gap-1">
        <button
          id="btn-hint"
          onClick={onToggleHint}
          title="Подсказка решения"
          className={`p-1.5 rounded-lg border transition-colors ${
            showHint
              ? 'bg-amber-500 text-neutral-950 border-amber-400'
              : 'bg-neutral-700/60 text-neutral-300 border-neutral-600 hover:bg-neutral-600'
          }`}
        >
          <Lightbulb size={16} />
        </button>

        <button
          id="btn-settings"
          onClick={onOpenSettings}
          title="Настройки"
          className="p-1.5 rounded-lg bg-neutral-700/60 text-neutral-300 border border-neutral-600 hover:bg-neutral-600 transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};

export const BottomControls: React.FC<GameHUDProps> = ({
  sheepCount,
  placedSheepCount,
  availableFences,
  totalFences,
  gameStep,
  onStartSimulation,
  onResetFences,
  simulationSpeed,
  onToggleSpeed,
}) => {
  const unplacedSheepCount = Math.max(0, sheepCount - placedSheepCount);

  return (
    <div className="w-full max-w-[440px] mx-auto px-4 py-3 flex flex-col items-center gap-2 select-none">
      {/* STEP 2: Place Sheep Dock */}
      {gameStep === 'PLACE_SHEEP' && (
        <div className="w-full bg-neutral-800/90 border border-neutral-700 rounded-2xl p-3 shadow-xl flex flex-col items-center gap-2 animate-fade-in">
          <p className="text-xs text-neutral-400 font-semibold">
            Нажми на свободную траву, чтобы поместить овечку:
          </p>
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: sheepCount }).map((_, i) => {
              const isPlaced = i < placedSheepCount;
              return (
                <div
                  key={`sheep-dock-${i}`}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all ${
                    isPlaced
                      ? 'border-emerald-500/50 bg-emerald-950/40 opacity-40'
                      : 'border-amber-400 bg-amber-950/40 shadow-lg scale-105 animate-pulse'
                  }`}
                >
                  <SheepSprite size={40} />
                </div>
              );
            })}
          </div>
          {unplacedSheepCount > 0 ? (
            <span className="text-xs text-amber-300 font-bold">
              Осталось расставить: {unplacedSheepCount}
            </span>
          ) : (
            <span className="text-xs text-emerald-400 font-bold">
              Все овцы на поле! Переходим к заборам...
            </span>
          )}
        </div>
      )}

      {/* STEP 3: Place Fences Controls */}
      {gameStep === 'PLACE_FENCES' && (
        <div className="w-full flex flex-col gap-2 animate-fade-in">
          {/* Inventory bar */}
          <div className="flex items-center justify-between bg-neutral-800/90 border border-neutral-700 px-4 py-2.5 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Доступно заборов:</span>
              <span className="text-base font-extrabold text-amber-400">
                {availableFences} / {totalFences}
              </span>
            </div>

            <button
              id="btn-reset-fences"
              onClick={onResetFences}
              className="flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-800/80 px-2.5 py-1.5 rounded-lg hover:bg-rose-900/60 transition-colors"
            >
              <RotateCcw size={12} />
              Сброс
            </button>
          </div>

          {/* Big Launch Wolves Button (Matching Screenshot) */}
          <button
            id="btn-launch-wolves"
            onClick={onStartSimulation}
            className="w-full py-3.5 px-6 rounded-xl font-black text-base tracking-wide bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-900/40 border border-emerald-400 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            Запустить волков
          </button>
        </div>
      )}

      {/* SIMULATING CONTROLS */}
      {gameStep === 'SIMULATING' && (
        <div className="w-full flex items-center justify-between bg-neutral-800/90 border border-neutral-700 px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-neutral-200">Симуляция волков...</span>
          </div>

          <button
            id="btn-sim-speed"
            onClick={onToggleSpeed}
            className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-700/60 px-3 py-1.5 rounded-lg hover:bg-amber-900/60 transition-colors"
          >
            <FastForward size={14} />
            Скорость: {simulationSpeed}x
          </button>
        </div>
      )}
    </div>
  );
};
