import React, { useState } from 'react';
import { LevelData } from '../types';
import { solveCandidateBoard } from '../utils/generator';
import { X, RefreshCw, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

interface SandboxModalProps {
  onClose: () => void;
  onPlayCustomLevel: (level: LevelData) => void;
}

export const SandboxModal: React.FC<SandboxModalProps> = ({ onClose, onPlayCustomLevel }) => {
  const [gridSize, setGridSize] = useState<number>(6);
  const [entrancesCount, setEntrancesCount] = useState<number>(2);
  const [sheepCount, setSheepCount] = useState<number>(2);
  const [wolfCount, setWolfCount] = useState<number>(2);
  const [obstaclesCount, setObstaclesCount] = useState<number>(3);
  const [bonusFences, setBonusFences] = useState<number>(1);
  const [seed, setSeed] = useState<number>(12345);

  const [generatedLevel, setGeneratedLevel] = useState<LevelData | null>(null);
  const [solverStats, setSolverStats] = useState<{
    minFencesK: number;
    valid: boolean;
    reason?: string;
  } | null>(null);

  const handleGenerateAndSolve = () => {
    // Generate board based on current parameters and test with reverse-solver
    const entrances = Array.from({ length: entrancesCount }, (_, i) => {
      const step = Math.floor(gridSize / (entrancesCount + 1));
      const x = Math.min(gridSize - 1, Math.max(0, (i + 1) * step));
      return {
        id: `ent-${i + 1}`,
        side: 'bottom' as const,
        x,
        y: gridSize - 1,
        label: `Вход ${i + 1}`,
      };
    });

    // Randomize obstacle positions
    const allCoords: { x: number; y: number }[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!entrances.some(e => e.x === x && e.y === y)) {
          allCoords.push({ x, y });
        }
      }
    }

    // Shuffle coords deterministically with seed
    let s = seed;
    const nextRand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const shuffled = [...allCoords].sort(() => nextRand() - 0.5);
    const obstacles = shuffled.slice(0, obstaclesCount);
    const candidateSheep = shuffled.slice(obstaclesCount, obstaclesCount + sheepCount);

    // Run Reverse-Solving Min-Cut algorithm
    const solution = solveCandidateBoard(gridSize, entrances, candidateSheep, obstacles);

    setSolverStats({
      minFencesK: solution.minFences,
      valid: solution.valid,
      reason: solution.valid
        ? `Найдено оптимальное решение: $K = ${solution.minFences}$ заборов. Уровень гарантированно разрешим!`
        : 'Уровень не имеет решений в заданных ограничениях или тривиален.',
    });

    if (solution.valid) {
      setGeneratedLevel({
        id: 999,
        seed,
        gridSize,
        sheepCount,
        wolfCount,
        entrances,
        obstacles,
        availableFences: solution.minFences + bonusFences,
        minFencesRequired: solution.minFences,
        initialSheepPositions: candidateSheep,
        solutionFences: solution.solutionFences,
        difficulty: 'medium',
      });
    } else {
      setGeneratedLevel(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-neutral-900 border-2 border-amber-600 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-amber-400">
              Генератор уровней (Procedural Sandbox)
            </h3>
            <p className="text-[11px] text-neutral-400">
              Тестирование алгоритма Reverse-Solving / Min-Cut
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Parameters Controls */}
        <div className="flex flex-col gap-3 bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800 text-xs">
          {/* Grid Size */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-300">Размер сетки (Grid Size):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={5}
                max={9}
                value={gridSize}
                onChange={e => setGridSize(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="w-8 text-right font-black text-amber-400">
                {gridSize}x{gridSize}
              </span>
            </div>
          </div>

          {/* Entrances Count */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-300">Входы волков (Entrances):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={4}
                value={entrancesCount}
                onChange={e => setEntrancesCount(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="w-8 text-right font-black text-amber-400">{entrancesCount}</span>
            </div>
          </div>

          {/* Sheep Count */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-300">Количество овец (Sheep):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={4}
                value={sheepCount}
                onChange={e => setSheepCount(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="w-8 text-right font-black text-amber-400">{sheepCount}</span>
            </div>
          </div>

          {/* Wolf Count */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-300">Количество волков (Wolves):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={5}
                value={wolfCount}
                onChange={e => setWolfCount(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="w-8 text-right font-black text-rose-400">{wolfCount}</span>
            </div>
          </div>

          {/* Obstacles */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-300">Препятствия (Obstacles):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={6}
                value={obstaclesCount}
                onChange={e => setObstaclesCount(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="w-8 text-right font-black text-neutral-300">{obstaclesCount}</span>
            </div>
          </div>

          {/* Bonus Fences */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-300">Запас заборов (+N к K):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={3}
                value={bonusFences}
                onChange={e => setBonusFences(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="w-8 text-right font-black text-emerald-400">+{bonusFences}</span>
            </div>
          </div>

          {/* Seed */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
            <span className="font-bold text-neutral-400">Случайный Seed:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={seed}
                onChange={e => setSeed(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-mono text-xs"
              />
              <button
                onClick={() => setSeed(Math.floor(Math.random() * 999999))}
                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                title="Случайный seed"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Generate & Solve Button */}
        <button
          onClick={handleGenerateAndSolve}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 active:scale-95 font-black text-neutral-950 flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <RefreshCw size={16} />
          Запустить алгоритм генерации и Min-Cut
        </button>

        {/* Results / Solvability Proof */}
        {solverStats && (
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-1.5 text-xs ${
              solverStats.valid
                ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-300'
                : 'bg-rose-950/40 border-rose-600/80 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm">
              {solverStats.valid ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={18} className="text-rose-400" />
              )}
              {solverStats.valid ? 'Гарантированно Решаемый Уровень!' : 'Решение не найдено'}
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">{solverStats.reason}</p>
            {solverStats.valid && (
              <div className="mt-1 flex items-center justify-between text-neutral-200 border-t border-emerald-800/60 pt-1.5">
                <span>Мин. заборов (K): <strong className="text-amber-400">{solverStats.minFencesK}</strong></span>
                <span>Выдано игроку: <strong className="text-emerald-400">{solverStats.minFencesK + bonusFences}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Play Custom Level Button */}
        {generatedLevel && (
          <button
            onClick={() => {
              onPlayCustomLevel(generatedLevel);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 active:scale-95 font-black text-white flex items-center justify-center gap-2 shadow-xl border border-emerald-400 transition-all"
          >
            <Play size={18} fill="currentColor" />
            Играть в сгенерированный уровень
          </button>
        )}
      </div>
    </div>
  );
};
