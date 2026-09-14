/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Position, Edge, GameStep, Wolf, LevelData } from './types';
import { generateProceduralLevel } from './utils/generator';
import { findPathAStar, generatePatrolAndExitPath, arePositionsEqual, edgeKey } from './utils/pathfinding';
import {
  playButtonClick,
  playWolfHowl,
  playWolfFrustrated,
  playVictory,
  playDefeat,
  playStepSound,
  setSoundMuted,
  getSoundMuted,
} from './utils/audio';
import { MobileFrame } from './components/MobileFrame';
import { GameBoard } from './components/GameBoard';
import { TopBar, BottomControls } from './components/GameHUD';
import { StartModal, VictoryModal, DefeatModal, SettingsModal, AndroidApkModal } from './components/Modals';
import { SandboxModal } from './components/SandboxModal';

export default function App() {
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [levelData, setLevelData] = useState<LevelData>(() => generateProceduralLevel(1));
  const [gameStep, setGameStep] = useState<GameStep>('START_POPUP');

  // Interactive gameplay state
  const [placedSheep, setPlacedSheep] = useState<Position[]>([]);
  const [placedFences, setPlacedFences] = useState<Edge[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(getSoundMuted());

  // Simulation state
  const [activeWolf, setActiveWolf] = useState<Wolf | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Уровень 1: Подготовься к защите овец!');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // Modals state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSandbox, setShowSandbox] = useState<boolean>(false);
  const [showApkGuide, setShowApkGuide] = useState<boolean>(false);

  const isSimulatingRef = useRef<boolean>(false);
  const simTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset level
  const loadLevel = useCallback((lvlId: number, customData?: LevelData) => {
    if (simTimeoutRef.current) {
      clearTimeout(simTimeoutRef.current);
    }
    isSimulatingRef.current = false;
    setActiveWolf(null);

    const level = customData || generateProceduralLevel(lvlId);
    setLevelData(level);
    setCurrentLevelId(lvlId);
    setPlacedFences([]);
    setShowHint(false);

    // Initial sheep state: auto-placed at recommended spots for ease,
    // or placed into inventory if player wants full manual placement
    if (level.initialSheepPositions && level.initialSheepPositions.length > 0) {
      setPlacedSheep(level.initialSheepPositions);
      setGameStep('START_POPUP');
    } else {
      setPlacedSheep([]);
      setGameStep('START_POPUP');
    }

    setStatusMessage(`Уровень ${lvlId}: расставь овец и огради их от волков!`);
  }, []);

  useEffect(() => {
    loadLevel(1);
    return () => {
      if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    };
  }, [loadLevel]);

  // Step 1: Start Level button handler
  const handleStartLevel = () => {
    playButtonClick();
    if (placedSheep.length < levelData.sheepCount) {
      setGameStep('PLACE_SHEEP');
      setStatusMessage('Перетащи овец на поле (или кликни на зеленую траву)');
    } else {
      setGameStep('PLACE_FENCES');
      setStatusMessage('Перетащи заборы на поле (нажми для поворота и установки)');
    }
  };

  // Step 2: Sheep placement
  const handlePlaceSheep = (pos: Position) => {
    if (placedSheep.length < levelData.sheepCount) {
      const nextSheep = [...placedSheep, pos];
      setPlacedSheep(nextSheep);
      if (nextSheep.length === levelData.sheepCount) {
        setGameStep('PLACE_FENCES');
        setStatusMessage('Овцы на месте! Теперь расставь заборы на гранях клеток.');
      } else {
        setStatusMessage(`Осталось овец: ${levelData.sheepCount - nextSheep.length}`);
      }
    }
  };

  const handleRemoveSheep = (index: number) => {
    const nextSheep = placedSheep.filter((_, i) => i !== index);
    setPlacedSheep(nextSheep);
    setGameStep('PLACE_SHEEP');
    setStatusMessage(`Овца убрана. Осталось расставить: ${levelData.sheepCount - nextSheep.length}`);
  };

  // Step 3: Fences placement
  const handleToggleFence = (edge: Edge) => {
    const key = edgeKey(edge);
    const existingIndex = placedFences.findIndex(f => edgeKey(f) === key);

    if (existingIndex >= 0) {
      // Remove fence
      const nextFences = placedFences.filter((_, i) => i !== existingIndex);
      setPlacedFences(nextFences);
      setStatusMessage(`Забор снят. Осталось: ${levelData.availableFences - nextFences.length}`);
    } else if (placedFences.length < levelData.availableFences) {
      // Place fence
      const nextFences = [...placedFences, edge];
      setPlacedFences(nextFences);
      setStatusMessage(`Забор установлен. Осталось: ${levelData.availableFences - nextFences.length}`);
    }
  };

  const handleResetFences = () => {
    playButtonClick();
    setPlacedFences([]);
    setStatusMessage(`Заборы сброшены. Доступно: ${levelData.availableFences}`);
  };

  // Step 4-7: Simulation Runner (Wolves Pathfinding & Patrol)
  const runSimulation = useCallback(() => {
    if (placedSheep.length === 0) {
      setStatusMessage('Сначала расставь овец на поле!');
      return;
    }

    playButtonClick();
    setGameStep('SIMULATING');
    isSimulatingRef.current = true;
    setShowHint(false);

    const stepDelay = Math.max(80, Math.floor(320 / simulationSpeed));
    const pauseDelay = Math.max(250, Math.floor(700 / simulationSpeed));

    // Simulation of all wolves in sequence
    let wolfIdx = 0;

    const simulateNextWolf = () => {
      if (!isSimulatingRef.current) return;

      if (wolfIdx >= levelData.wolfCount) {
        // ALL WOLVES COMPLETED SAFELY -> VICTORY! (Step 8)
        isSimulatingRef.current = false;
        setActiveWolf(null);
        setGameStep('VICTORY');
        setStatusMessage('Уровень пройден! Все овцы в безопасности!');
        playVictory();

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas confetti is restricted
        }
        return;
      }

      // Pick entrance for this wolf (round-robin among entrances)
      const entrance = levelData.entrances[wolfIdx % levelData.entrances.length];
      const startPos: Position = { x: entrance.x, y: entrance.y };

      const wolfNumber = wolfIdx + 1;
      const wolfWord = wolfNumber === 1 ? 'Первый' : wolfNumber === 2 ? 'Второй' : wolfNumber === 3 ? 'Третий' : `${wolfNumber}-й`;
      setStatusMessage(`${wolfWord} волк заходит в загон и ищет путь к овцам...`);
      playWolfHowl();

      // Run A* pathfinding to nearest sheep
      const huntingPath = findPathAStar(
        startPos,
        placedSheep,
        levelData.gridSize,
        levelData.obstacles,
        placedFences
      );

      if (huntingPath && huntingPath.length > 0) {
        // Wolf CAN reach a sheep!
        const wolf: Wolf = {
          id: `wolf-${wolfNumber}`,
          entranceIndex: wolfIdx,
          currentPos: startPos,
          state: 'HUNTING',
          path: huntingPath,
          stepIndex: 0,
        };
        setActiveWolf(wolf);

        // Animate wolf walking step-by-step along huntingPath
        let currentStep = 0;
        const walkInterval = setInterval(() => {
          if (!isSimulatingRef.current) {
            clearInterval(walkInterval);
            return;
          }

          currentStep++;
          if (currentStep < huntingPath.length) {
            setActiveWolf(prev =>
              prev ? { ...prev, currentPos: huntingPath[currentStep], stepIndex: currentStep } : null
            );
            playStepSound();
          } else {
            // Reached sheep! Defeat!
            clearInterval(walkInterval);
            isSimulatingRef.current = false;
            setGameStep('DEFEAT');
            setStatusMessage(`Волк поймал овечку на клетке (${huntingPath[currentStep - 1].x + 1}, ${huntingPath[currentStep - 1].y + 1})!`);
            playDefeat();
          }
        }, stepDelay);
      } else {
        // Path is BLOCKED! Wolf patrols and exits
        playWolfFrustrated();
        const patrolPath = generatePatrolAndExitPath(
          startPos,
          startPos,
          levelData.gridSize,
          levelData.obstacles,
          placedFences
        );

        const wolf: Wolf = {
          id: `wolf-${wolfNumber}`,
          entranceIndex: wolfIdx,
          currentPos: startPos,
          state: 'BLOCKED_PATROL',
          path: patrolPath,
          stepIndex: 0,
        };
        setActiveWolf(wolf);

        let currentStep = 0;
        const walkInterval = setInterval(() => {
          if (!isSimulatingRef.current) {
            clearInterval(walkInterval);
            return;
          }

          currentStep++;
          if (currentStep < patrolPath.length) {
            setActiveWolf(prev =>
              prev ? { ...prev, currentPos: patrolPath[currentStep], stepIndex: currentStep } : null
            );
            playStepSound();

            if (currentStep === Math.floor(patrolPath.length / 2)) {
              setStatusMessage(`${wolfWord} волк не нашёл овец и уходит.`);
            }
          } else {
            // Wolf exits the board!
            clearInterval(walkInterval);
            setActiveWolf(null);
            setStatusMessage(`${wolfWord} волк ушёл с поля.`);

            wolfIdx++;
            simTimeoutRef.current = setTimeout(simulateNextWolf, pauseDelay);
          }
        }, stepDelay);
      }
    };

    simTimeoutRef.current = setTimeout(simulateNextWolf, 300);
  }, [levelData, placedSheep, placedFences, simulationSpeed]);

  const handleNextLevel = () => {
    playButtonClick();
    loadLevel(currentLevelId + 1);
  };

  const handleReplay = () => {
    playButtonClick();
    loadLevel(currentLevelId);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setSoundMuted(nextMuted);
  };

  const handleToggleSpeed = () => {
    playButtonClick();
    setSimulationSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
  };

  const handleShowHint = () => {
    playButtonClick();
    setShowHint(true);
    setStatusMessage('Подсказка: желтые светящиеся линии показывают ключевые заборы.');
  };

  const availableFencesRemaining = Math.max(0, levelData.availableFences - placedFences.length);

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col justify-between max-w-full overflow-x-hidden">
        {/* TOP BAR */}
        <TopBar
          levelId={levelData.id}
          sheepCount={levelData.sheepCount}
          placedSheepCount={placedSheep.length}
          wolfCount={levelData.wolfCount}
          availableFences={availableFencesRemaining}
          onOpenSettings={() => setShowSettings(true)}
          onToggleHint={handleShowHint}
          showHint={showHint}
        />

        {/* 2D GAMEPLAY FIELD */}
        <div className="flex-1 flex items-center justify-center p-2">
          <GameBoard
            gridSize={levelData.gridSize}
            entrances={levelData.entrances}
            obstacles={levelData.obstacles}
            sheep={placedSheep}
            fences={placedFences}
            availableFences={availableFencesRemaining}
            gameStep={gameStep}
            activeWolf={activeWolf}
            statusMessage={statusMessage}
            onPlaceSheep={handlePlaceSheep}
            onRemoveSheep={handleRemoveSheep}
            onToggleFence={handleToggleFence}
            hintFences={levelData.solutionFences}
            showHint={showHint}
          />
        </div>

        {/* BOTTOM CONTROLS (Steps 2, 3, 4) */}
        <BottomControls
          levelId={levelData.id}
          sheepCount={levelData.sheepCount}
          placedSheepCount={placedSheep.length}
          totalWolves={levelData.wolfCount}
          availableFences={availableFencesRemaining}
          totalFences={levelData.availableFences}
          gameStep={gameStep}
          onStartSimulation={runSimulation}
          onResetFences={handleResetFences}
          onOpenSettings={() => setShowSettings(true)}
          onToggleHint={handleShowHint}
          showHint={showHint}
          simulationSpeed={simulationSpeed}
          onToggleSpeed={handleToggleSpeed}
        />

        {/* MODALS */}
        {gameStep === 'START_POPUP' && (
          <StartModal level={levelData} onStart={handleStartLevel} />
        )}

        {gameStep === 'VICTORY' && (
          <VictoryModal
            levelId={levelData.id}
            onNextLevel={handleNextLevel}
            onReplay={handleReplay}
            onOpenMenu={() => setShowSettings(true)}
          />
        )}

        {gameStep === 'DEFEAT' && (
          <DefeatModal
            onReplay={handleReplay}
            onShowHint={handleShowHint}
            onOpenMenu={() => setShowSettings(true)}
          />
        )}

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            currentLevel={currentLevelId}
            onSelectLevel={lvl => loadLevel(lvl)}
            onOpenSandbox={() => setShowSandbox(true)}
            onOpenApkGuide={() => setShowApkGuide(true)}
          />
        )}

        {showApkGuide && (
          <AndroidApkModal
            onClose={() => setShowApkGuide(false)}
          />
        )}

        {showSandbox && (
          <SandboxModal
            onClose={() => setShowSandbox(false)}
            onPlayCustomLevel={customLevel => {
              loadLevel(customLevel.id, customLevel);
            }}
          />
        )}
      </div>
    </MobileFrame>
  );
}
