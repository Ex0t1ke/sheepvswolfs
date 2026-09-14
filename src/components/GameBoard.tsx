import React, { useState, useRef } from 'react';
import { Position, Edge, GameStep, Wolf } from '../types';
import { SheepSprite, WolfSprite, ObstacleSprite, WoodenFenceSprite } from './GameIcons';
import { arePositionsEqual, edgeKey } from '../utils/pathfinding';
import { playFencePlace, playFenceRemove, playSheepBleat } from '../utils/audio';

interface GameBoardProps {
  gridSize: number;
  entrances: { id: string; x: number; y: number; label?: string }[];
  obstacles: Position[];
  sheep: Position[];
  fences: Edge[];
  availableFences: number;
  gameStep: GameStep;
  activeWolf: Wolf | null;
  statusMessage: string;
  onPlaceSheep: (pos: Position) => void;
  onRemoveSheep: (index: number) => void;
  onToggleFence: (edge: Edge) => void;
  hintFences?: Edge[];
  showHint?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gridSize,
  entrances,
  obstacles,
  sheep,
  fences,
  availableFences,
  gameStep,
  activeWolf,
  statusMessage,
  onPlaceSheep,
  onRemoveSheep,
  onToggleFence,
  hintFences = [],
  showHint = false,
}) => {
  const [hoverEdge, setHoverEdge] = useState<Edge | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Set of fences for quick lookup
  const fenceKeys = new Set(fences.map(edgeKey));
  const hintKeys = new Set(hintFences.map(edgeKey));

  // Determine board pixel dimensions
  // Standard responsive sizing: each cell is approx 48-64px depending on grid size
  const cellSize = gridSize <= 5 ? 64 : gridSize <= 6 ? 56 : gridSize <= 7 ? 48 : 42;
  const boardWidth = gridSize * cellSize;
  const boardHeight = gridSize * cellSize;

  const isCellObstacle = (x: number, y: number) =>
    obstacles.some(o => o.x === x && o.y === y);

  const getSheepAt = (x: number, y: number) =>
    sheep.findIndex(s => s.x === x && s.y === y);

  const isEntranceCell = (x: number, y: number) =>
    entrances.find(e => e.x === x && e.y === y);

  const handleCellClick = (x: number, y: number) => {
    if (gameStep === 'PLACE_SHEEP') {
      const sheepIdx = getSheepAt(x, y);
      if (sheepIdx >= 0) {
        // Remove sheep back to dock
        onRemoveSheep(sheepIdx);
        playSheepBleat();
      } else if (!isCellObstacle(x, y) && !isEntranceCell(x, y)) {
        // Place sheep here
        onPlaceSheep({ x, y });
        playSheepBleat();
      }
    }
  };

  const handleEdgeClick = (edge: Edge) => {
    if (gameStep !== 'PLACE_FENCES') return;

    const exists = fenceKeys.has(edgeKey(edge));
    if (exists) {
      onToggleFence(edge);
      playFenceRemove();
    } else if (availableFences > 0) {
      onToggleFence(edge);
      playFencePlace();
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-[440px] mx-auto">
      {/* Wooden Outer Enclosure Frame */}
      <div
        ref={boardRef}
        style={{
          width: boardWidth + 36,
          height: boardHeight + 46,
        }}
        className="relative bg-emerald-800 rounded-2xl p-4 shadow-2xl border-[8px] border-[#5a2e12] overflow-hidden"
      >
        {/* Lush Grass Surface Background Texture */}
        <div
          className="absolute inset-2 rounded-xl bg-gradient-to-b from-[#408331] via-[#478f35] to-[#3a752b] overflow-hidden shadow-inner"
        >
          {/* Subtle grass blades and flowers */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Decorative daisies & clovers scattered */}
          <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-yellow-200 opacity-60 pointer-events-none" />
          <div className="absolute top-10 right-4 w-2 h-2 rounded-full bg-yellow-100 opacity-50 pointer-events-none" />
          <div className="absolute bottom-12 left-5 w-2.5 h-2.5 rounded-full bg-white opacity-40 pointer-events-none" />
          <div className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-amber-200 opacity-60 pointer-events-none" />

          {/* Grid lines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundSize: `${cellSize}px ${cellSize}px`,
              backgroundImage:
                'linear-gradient(to right, rgba(0, 0, 0, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.07) 1px, transparent 1px)',
            }}
          />
        </div>

        {/* Grid Container */}
        <div
          style={{
            width: boardWidth,
            height: boardHeight,
          }}
          className="relative z-10 m-auto"
        >
          {/* 1. Cells layer (Obstacles, highlights, sheep targets) */}
          {Array.from({ length: gridSize }).map((_, y) => (
            <div key={`row-${y}`} className="flex">
              {Array.from({ length: gridSize }).map((_, x) => {
                const isObstacle = isCellObstacle(x, y);
                const sheepIdx = getSheepAt(x, y);
                const entrance = isEntranceCell(x, y);
                const isSheepPlacementCandidate =
                  gameStep === 'PLACE_SHEEP' && !isObstacle && !entrance && sheepIdx < 0;

                return (
                  <div
                    key={`cell-${x}-${y}`}
                    id={`cell-${x}-${y}`}
                    style={{ width: cellSize, height: cellSize }}
                    onClick={() => handleCellClick(x, y)}
                    className={`relative flex items-center justify-center transition-colors duration-150 ${
                      isSheepPlacementCandidate
                        ? 'cursor-pointer hover:bg-white/20 active:bg-white/30'
                        : sheepIdx >= 0 && gameStep === 'PLACE_SHEEP'
                        ? 'cursor-pointer hover:brightness-110'
                        : ''
                    }`}
                  >
                    {/* Ghost highlight in Step 2: "Place sheep" */}
                    {isSheepPlacementCandidate && (
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center animate-pulse">
                        <span className="text-white/60 text-xs font-bold">+</span>
                      </div>
                    )}

                    {/* Static Obstacle */}
                    {isObstacle && (
                      <div className="pointer-events-none">
                        <ObstacleSprite
                          size={cellSize * 0.72}
                          type={(x + y) % 2 === 0 ? 'stump' : 'rock'}
                        />
                      </div>
                    )}

                    {/* Placed Sheep */}
                    {sheepIdx >= 0 && (
                      <div className="z-20 cursor-pointer">
                        <SheepSprite
                          size={cellSize * 0.85}
                          isSafe={gameStep === 'VICTORY'}
                          isScared={activeWolf?.state === 'HUNTING'}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* 2. Wolf Path Visual Overlay (Red hunting path or Blue patrol/exit path) */}
          {activeWolf && activeWolf.path.length > 1 && (
            <svg
              className="absolute inset-0 pointer-events-none z-15 overflow-visible"
              width={boardWidth}
              height={boardHeight}
            >
              <defs>
                <marker
                  id="pathArrowRed"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                </marker>
                <marker
                  id="pathArrowBlue"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                </marker>
              </defs>

              {/* Draw connected dashed path line */}
              <polyline
                points={activeWolf.path
                  .map(p => `${p.x * cellSize + cellSize / 2},${p.y * cellSize + cellSize / 2}`)
                  .join(' ')}
                fill="none"
                stroke={activeWolf.state === 'HUNTING' ? '#ef4444' : '#38bdf8'}
                strokeWidth="3.5"
                strokeDasharray="6,4"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={
                  activeWolf.state === 'HUNTING' ? 'url(#pathArrowRed)' : 'url(#pathArrowBlue)'
                }
                className="opacity-90 animate-pulse"
              />

              {/* Waypoint dots */}
              {activeWolf.path.map((p, idx) => (
                <circle
                  key={`waypoint-${idx}`}
                  cx={p.x * cellSize + cellSize / 2}
                  cy={p.y * cellSize + cellSize / 2}
                  r="3.5"
                  fill={activeWolf.state === 'HUNTING' ? '#ef4444' : '#0284c7'}
                />
              ))}
            </svg>
          )}

          {/* 3. Active Animated Wolf */}
          {activeWolf && (
            <div
              style={{
                width: cellSize,
                height: cellSize,
                left: activeWolf.currentPos.x * cellSize,
                top: activeWolf.currentPos.y * cellSize,
              }}
              className="absolute z-30 flex items-center justify-center transition-all duration-300 pointer-events-none"
            >
              <WolfSprite
                size={cellSize * 0.9}
                isConfused={activeWolf.state === 'BLOCKED_PATROL' || activeWolf.state === 'EXITING'}
              />
            </div>
          )}

          {/* 4. Horizontal Internal Edges & Fences */}
          {Array.from({ length: gridSize - 1 }).map((_, y) => (
            <div key={`h-edges-${y}`}>
              {Array.from({ length: gridSize }).map((_, x) => {
                const edge: Edge = { x, y, orientation: 'h' };
                const isPlaced = fenceKeys.has(edgeKey(edge));
                const isHint = showHint && hintKeys.has(edgeKey(edge));
                const isHovered =
                  hoverEdge?.x === x && hoverEdge?.y === y && hoverEdge?.orientation === 'h';

                return (
                  <div
                    key={`h-edge-${x}-${y}`}
                    id={`edge-h-${x}-${y}`}
                    style={{
                      left: x * cellSize,
                      top: (y + 1) * cellSize - 10,
                      width: cellSize,
                      height: 20,
                    }}
                    onMouseEnter={() => gameStep === 'PLACE_FENCES' && setHoverEdge(edge)}
                    onMouseLeave={() => setHoverEdge(null)}
                    onClick={() => handleEdgeClick(edge)}
                    className={`absolute z-25 flex items-center justify-center cursor-pointer group ${
                      gameStep === 'PLACE_FENCES' ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    {/* Placed Fence */}
                    {isPlaced ? (
                      <div className="transition-transform group-hover:scale-105">
                        <WoodenFenceSprite orientation="h" length={cellSize + 4} thickness={14} />
                      </div>
                    ) : isHint ? (
                      /* Hint highlight */
                      <div className="w-full h-3 bg-amber-400/70 rounded border-2 border-dashed border-amber-300 animate-bounce" />
                    ) : isHovered && availableFences > 0 ? (
                      /* Hover preview */
                      <WoodenFenceSprite
                        orientation="h"
                        length={cellSize}
                        thickness={12}
                        preview={true}
                      />
                    ) : (
                      /* Transparent hoverable line */
                      <div className="w-full h-1.5 bg-black/10 rounded group-hover:bg-amber-400/40 transition-colors" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* 5. Vertical Internal Edges & Fences */}
          {Array.from({ length: gridSize }).map((_, y) => (
            <div key={`v-edges-${y}`}>
              {Array.from({ length: gridSize - 1 }).map((_, x) => {
                const edge: Edge = { x, y, orientation: 'v' };
                const isPlaced = fenceKeys.has(edgeKey(edge));
                const isHint = showHint && hintKeys.has(edgeKey(edge));
                const isHovered =
                  hoverEdge?.x === x && hoverEdge?.y === y && hoverEdge?.orientation === 'v';

                return (
                  <div
                    key={`v-edge-${x}-${y}`}
                    id={`edge-v-${x}-${y}`}
                    style={{
                      left: (x + 1) * cellSize - 10,
                      top: y * cellSize,
                      width: 20,
                      height: cellSize,
                    }}
                    onMouseEnter={() => gameStep === 'PLACE_FENCES' && setHoverEdge(edge)}
                    onMouseLeave={() => setHoverEdge(null)}
                    onClick={() => handleEdgeClick(edge)}
                    className={`absolute z-25 flex items-center justify-center cursor-pointer group ${
                      gameStep === 'PLACE_FENCES' ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    {/* Placed Fence */}
                    {isPlaced ? (
                      <div className="transition-transform group-hover:scale-105">
                        <WoodenFenceSprite orientation="v" length={cellSize + 4} thickness={14} />
                      </div>
                    ) : isHint ? (
                      /* Hint highlight */
                      <div className="w-3 h-full bg-amber-400/70 rounded border-2 border-dashed border-amber-300 animate-bounce" />
                    ) : isHovered && availableFences > 0 ? (
                      /* Hover preview */
                      <WoodenFenceSprite
                        orientation="v"
                        length={cellSize}
                        thickness={12}
                        preview={true}
                      />
                    ) : (
                      /* Transparent hoverable line */
                      <div className="w-1.5 h-full bg-black/10 rounded group-hover:bg-amber-400/40 transition-colors" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* 6. Intersection Posts (Wooden Log Post Caps) */}
          {Array.from({ length: gridSize - 1 }).map((_, y) =>
            Array.from({ length: gridSize - 1 }).map((_, x) => (
              <div
                key={`post-${x}-${y}`}
                style={{
                  left: (x + 1) * cellSize - 6,
                  top: (y + 1) * cellSize - 6,
                }}
                className="absolute w-3 h-3 rounded-full bg-[#5c2f13] border border-[#2e1708] shadow-sm z-26 pointer-events-none"
              />
            ))
          )}
        </div>

        {/* 7. Entrances at the Bottom Boundary (Matching Screenshot with green arrows and "Вход") */}
        {entrances.map((ent, idx) => (
          <div
            key={`entrance-${ent.id}`}
            id={`entrance-${idx + 1}`}
            style={{
              left: 18 + ent.x * cellSize,
              bottom: 2,
              width: cellSize,
            }}
            className="absolute z-20 flex flex-col items-center pointer-events-none"
          >
            {/* Green Arrow Up pointing into the pen */}
            <div className="text-emerald-300 text-sm font-extrabold animate-bounce -mb-0.5">
              ▲
            </div>
            {/* Wooden/Green "Вход" Badge */}
            <div className="bg-[#14532d] text-[#86efac] border border-[#22c55e] text-[10px] font-black px-1.5 py-0.5 rounded shadow-md tracking-wide uppercase whitespace-nowrap">
              Вход
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Status / Action Subtitle Bar directly below board (Matching Screenshot) */}
      <div className="w-full mt-3 px-3 py-2 rounded-xl bg-neutral-800/90 border border-neutral-700 text-center shadow-md">
        <p className="text-xs sm:text-sm font-semibold text-neutral-200">{statusMessage}</p>
      </div>
    </div>
  );
};
