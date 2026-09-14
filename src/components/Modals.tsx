import React from 'react';
import { LevelData } from '../types';
import { Star, RotateCcw, Play, Volume2, VolumeX, Grid, HelpCircle, X, Sparkles } from 'lucide-react';
import { SheepSprite, WolfSprite, WoodenFenceSprite } from './GameIcons';

interface StartModalProps {
  level: LevelData;
  onStart: () => void;
}

export const StartModal: React.FC<StartModalProps> = ({ level, onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-sm bg-neutral-900 border-4 border-[#78350f] rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 text-center">
        {/* Wooden Level Header Banner (Matching Screenshot 1) */}
        <div className="relative -mt-10 px-8 py-2.5 rounded-xl bg-gradient-to-b from-[#b45309] to-[#78350f] border-2 border-[#d97706] shadow-xl">
          <span className="font-black text-xl text-amber-100 tracking-wider drop-shadow">
            Уровень {level.id}
          </span>
        </div>

        {/* Level Objectives Card */}
        <div className="w-full bg-neutral-800/90 rounded-2xl p-4 border border-neutral-700/80 flex flex-col gap-3">
          {/* Sheep */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center">
                <SheepSprite size={24} />
              </div>
              <span className="text-sm font-bold text-neutral-200">Овец:</span>
            </div>
            <span className="text-base font-black text-amber-300">{level.sheepCount}</span>
          </div>

          {/* Wolves */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center text-lg">
                🐺
              </div>
              <span className="text-sm font-bold text-neutral-200">Волков:</span>
            </div>
            <span className="text-base font-black text-rose-400">{level.wolfCount}</span>
          </div>

          {/* Fences */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center">
                <WoodenFenceSprite orientation="h" length={24} thickness={8} />
              </div>
              <span className="text-sm font-bold text-neutral-200">Доп. заборы:</span>
            </div>
            <span className="text-base font-black text-amber-400">{level.availableFences}</span>
          </div>

          {/* Entrances */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400 font-black text-base">🚪</span>
              <span className="text-sm font-bold text-neutral-200">Входы:</span>
            </div>
            <span className="text-base font-black text-emerald-400">{level.entrances.length}</span>
          </div>
        </div>

        {/* Start Button (Matching Screenshot 1) */}
        <button
          id="btn-start-level"
          onClick={onStart}
          className="w-full py-3.5 px-6 rounded-2xl font-black text-lg text-white tracking-wide bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:brightness-110 active:scale-95 shadow-xl shadow-emerald-950/60 border border-emerald-400 transition-all flex items-center justify-center gap-2"
        >
          Начать
        </button>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  levelId: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelId,
  onNextLevel,
  onReplay,
  onOpenMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-sm bg-neutral-900 border-4 border-[#78350f] rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 text-center">
        {/* 3 Golden Stars (Matching Screenshot 8) */}
        <div className="flex items-center justify-center gap-2 -mt-12">
          <div className="transform -rotate-12 animate-bounce [animation-delay:100ms]">
            <Star size={44} className="fill-amber-400 text-amber-300 filter drop-shadow-lg" />
          </div>
          <div className="transform scale-125 animate-bounce [animation-delay:200ms]">
            <Star size={48} className="fill-amber-400 text-amber-300 filter drop-shadow-xl" />
          </div>
          <div className="transform rotate-12 animate-bounce [animation-delay:300ms]">
            <Star size={44} className="fill-amber-400 text-amber-300 filter drop-shadow-lg" />
          </div>
        </div>

        {/* Wooden Sign "Уровень пройден!" (Matching Screenshot 8) */}
        <div className="px-8 py-2.5 rounded-xl bg-gradient-to-b from-[#b45309] to-[#78350f] border-2 border-[#d97706] shadow-xl">
          <span className="font-black text-xl text-amber-100 tracking-wider">
            Уровень пройден!
          </span>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 font-semibold px-2">
          Все волки не смогли добраться ни до одной овцы и ушли ни с чем!
        </p>

        {/* Action Buttons (Matching Screenshot 8) */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="btn-next-level"
            onClick={onNextLevel}
            className="w-full py-3 px-4 rounded-xl font-black text-base text-white tracking-wide bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-950/50 border border-emerald-400 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Следующий уровень
          </button>

          <button
            id="btn-replay-level"
            onClick={onReplay}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-amber-200 bg-[#78350f]/80 hover:bg-[#78350f] border border-amber-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Переиграть
          </button>

          <button
            id="btn-menu"
            onClick={onOpenMenu}
            className="w-full py-2 px-4 rounded-xl font-bold text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            В меню / Настройки
          </button>
        </div>
      </div>
    </div>
  );
};

interface DefeatModalProps {
  onReplay: () => void;
  onShowHint: () => void;
  onOpenMenu: () => void;
}

export const DefeatModal: React.FC<DefeatModalProps> = ({ onReplay, onShowHint, onOpenMenu }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-sm bg-neutral-900 border-4 border-rose-900 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border-2 border-rose-600 flex items-center justify-center text-3xl shadow-xl -mt-10">
          🐺
        </div>

        <div className="px-6 py-2 rounded-xl bg-gradient-to-b from-rose-700 to-rose-950 border-2 border-rose-500 shadow-xl">
          <span className="font-black text-xl text-rose-100 tracking-wider">
            Овца поймана!
          </span>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 font-semibold px-2">
          Волк нашёл лазейку через забор и добрался до овец. Попробуй перекрыть проход иначе!
        </p>

        <div className="w-full flex flex-col gap-2.5 mt-2">
          <button
            id="btn-defeat-replay"
            onClick={onReplay}
            className="w-full py-3 px-4 rounded-xl font-black text-base text-white tracking-wide bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-110 active:scale-95 shadow-lg shadow-amber-950/50 border border-amber-500 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Попробовать снова
          </button>

          <button
            id="btn-defeat-hint"
            onClick={onShowHint}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-amber-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Показать подсказку решения
          </button>

          <button
            id="btn-defeat-menu"
            onClick={onOpenMenu}
            className="w-full py-2 px-4 rounded-xl font-bold text-xs text-neutral-400 hover:text-white transition-colors"
          >
            В меню
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentLevel: number;
  onSelectLevel: (lvl: number) => void;
  onOpenSandbox: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isMuted,
  onToggleMute,
  currentLevel,
  onSelectLevel,
  onOpenSandbox,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-sm bg-neutral-900 border-2 border-neutral-700 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="font-extrabold text-base text-amber-400">Настройки & Уровни</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between bg-neutral-800/80 px-4 py-3 rounded-xl border border-neutral-700">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-200">
            {isMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} className="text-emerald-400" />}
            Звуки и эффекты
          </div>
          <button
            onClick={onToggleMute}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
              isMuted
                ? 'bg-neutral-700 text-neutral-300 border-neutral-600'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            {isMuted ? 'Выкл' : 'Вкл'}
          </button>
        </div>

        {/* Level Select Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Выбор уровня:
          </span>
          <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
            {Array.from({ length: 20 }).map((_, i) => {
              const lvl = i + 1;
              const isCurrent = lvl === currentLevel;
              return (
                <button
                  key={`lvl-pick-${lvl}`}
                  onClick={() => {
                    onSelectLevel(lvl);
                    onClose();
                  }}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sandbox Generator Mode */}
        <button
          onClick={() => {
            onClose();
            onOpenSandbox();
          }}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-110 font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 border border-amber-500 shadow-md"
        >
          <Grid size={16} />
          Генератор уровней (Sandbox)
        </button>

        {/* Rules Reminder */}
        <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
          <strong className="text-neutral-300 block mb-1">Правила игры:</strong>
          1. Расставь овец на свободную траву.<br />
          2. Поставь заборы на границы клеток, чтобы отрезать волков от овец.<br />
          3. Запусти волков: они используют A* поиск пути. Если путь закрыт, волки уйдут с поля!
        </div>
      </div>
    </div>
  );
};
