export interface Position {
  x: number;
  y: number;
}

export interface Edge {
  // An edge between (x, y) and (x+1, y) is vertical (orientation: 'v')
  // An edge between (x, y) and (x, y+1) is horizontal (orientation: 'h')
  x: number;
  y: number;
  orientation: 'h' | 'v';
}

export type GameStep =
  | 'START_POPUP'     // Step 1: Start level overview
  | 'PLACE_SHEEP'    // Step 2: Drag/place sheep on field
  | 'PLACE_FENCES'   // Step 3: Place & rotate fences
  | 'SIMULATING'     // Step 4-7: Wolves hunting & exiting
  | 'VICTORY'        // Step 8: All wolves baffled, level complete!
  | 'DEFEAT';        // A sheep was caught

export interface Entrance {
  id: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  x: number;
  y: number;
  label?: string;
}

export interface Sheep {
  id: string;
  x: number; // grid cell x (-1 if not yet placed)
  y: number; // grid cell y (-1 if not yet placed)
  isSafe?: boolean;
  isTargeted?: boolean;
}

export type WolfState = 'WAITING' | 'ENTERING' | 'HUNTING' | 'BLOCKED_PATROL' | 'EXITING' | 'EATEN';

export interface Wolf {
  id: string;
  entranceIndex: number;
  currentPos: Position;
  targetSheepId?: string;
  state: WolfState;
  path: Position[];
  stepIndex: number;
}

export interface LevelData {
  id: number;
  seed: number;
  gridSize: number; // e.g. 5, 6, 7
  sheepCount: number;
  wolfCount: number;
  entrances: Entrance[];
  obstacles: Position[];
  availableFences: number; // player budget
  minFencesRequired: number; // K computed by Min-Cut solver
  initialSheepPositions?: Position[]; // Suggested/default positions
  solutionFences?: Edge[]; // Computed min-cut edge set for hints/guarantee
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface LevelConfigParams {
  gridSize: number;
  entrancesCount: number;
  sheepCount: number;
  wolfCount: number;
  obstaclesCount: number;
  difficultyBonusFences: number;
}
