import { Position, Edge, Entrance, LevelData, LevelConfigParams } from '../types';
import { edgeKey, posKey, findPathAStar } from './pathfinding';

/**
 * Linear Congruential Generator (LCG) for deterministic procedural generation.
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  shuffle<T>(arr: T[]): T[] {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  }
}

/**
 * Dinic / Edmonds-Karp Max-Flow Min-Cut Solver for Grid Graphs
 */
interface FlowEdge {
  u: number;
  v: number;
  cap: number;
  flow: number;
  rev: number;
  gridEdge?: Edge;
}

export class MinCutSolver {
  private n: number;
  private adj: FlowEdge[][] = [];
  private source: number;
  private sink: number;

  constructor(nodeCount: number, source: number, sink: number) {
    this.n = nodeCount;
    this.source = source;
    this.sink = sink;
    this.adj = Array.from({ length: nodeCount }, () => []);
  }

  addEdge(u: number, v: number, cap: number, gridEdge?: Edge) {
    const a: FlowEdge = { u, v, cap, flow: 0, rev: this.adj[v].length, gridEdge };
    const b: FlowEdge = { u: v, v: u, cap: 0, flow: 0, rev: this.adj[u].length, gridEdge };
    this.adj[u].push(a);
    this.adj[v].push(b);
  }

  addUndirectedGridEdge(u: number, v: number, cap: number, gridEdge: Edge) {
    // Both directions can carry capacity 1 in the undirected grid
    const e1: FlowEdge = { u, v, cap, flow: 0, rev: this.adj[v].length, gridEdge };
    const e2: FlowEdge = { u: v, v: u, cap, flow: 0, rev: this.adj[u].length, gridEdge };
    this.adj[u].push(e1);
    this.adj[v].push(e2);
  }

  solveMaxFlow(): number {
    let maxFlow = 0;

    // Edmonds-Karp BFS to find augmenting paths
    while (true) {
      const parentEdge: (FlowEdge | null)[] = Array(this.n).fill(null);
      const queue: number[] = [this.source];

      while (queue.length > 0) {
        const u = queue.shift()!;
        if (u === this.sink) break;

        for (const edge of this.adj[u]) {
          if (edge.cap - edge.flow > 0 && parentEdge[edge.v] === null && edge.v !== this.source) {
            parentEdge[edge.v] = edge;
            queue.push(edge.v);
          }
        }
      }

      if (parentEdge[this.sink] === null) {
        break; // No augmenting path found
      }

      // Find bottleneck capacity
      let push = Infinity;
      let curr = this.sink;
      while (curr !== this.source) {
        const edge = parentEdge[curr]!;
        push = Math.min(push, edge.cap - edge.flow);
        curr = edge.u;
      }

      // Augment flow along the path
      curr = this.sink;
      while (curr !== this.source) {
        const edge = parentEdge[curr]!;
        edge.flow += push;
        this.adj[edge.v][edge.rev].flow -= push;
        curr = edge.u;
      }

      maxFlow += push;
    }

    return maxFlow;
  }

  /**
   * After max flow, finds the minimum cut edges separating source from sink.
   */
  getMinCutEdges(): Edge[] {
    const visited = new Array(this.n).fill(false);
    const queue = [this.source];
    visited[this.source] = true;

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const edge of this.adj[u]) {
        if (edge.cap - edge.flow > 0 && !visited[edge.v]) {
          visited[edge.v] = true;
          queue.push(edge.v);
        }
      }
    }

    const cutEdges: Edge[] = [];
    const seenEdges = new Set<string>();

    for (let u = 0; u < this.n; u++) {
      if (visited[u]) {
        for (const edge of this.adj[u]) {
          if (!visited[edge.v] && edge.gridEdge) {
            const key = edgeKey(edge.gridEdge);
            if (!seenEdges.has(key)) {
              seenEdges.add(key);
              cutEdges.push(edge.gridEdge);
            }
          }
        }
      }
    }

    return cutEdges;
  }
}

/**
 * Determine level parameters based on level ID (difficulty curve)
 */
export function getParamsForLevel(levelId: number): LevelConfigParams {
  if (levelId === 1) {
    return {
      gridSize: 5,
      entrancesCount: 2,
      sheepCount: 2,
      wolfCount: 2,
      obstaclesCount: 2,
      difficultyBonusFences: 1, // K + 1 fences so player has flexibility
    };
  }
  if (levelId === 2) {
    return {
      gridSize: 5,
      entrancesCount: 2,
      sheepCount: 2,
      wolfCount: 2,
      obstaclesCount: 2,
      difficultyBonusFences: 1,
    };
  }
  if (levelId <= 4) {
    return {
      gridSize: 6,
      entrancesCount: 2,
      sheepCount: 2,
      wolfCount: 3,
      obstaclesCount: 3,
      difficultyBonusFences: 1,
    };
  }
  if (levelId <= 7) {
    return {
      gridSize: 6,
      entrancesCount: 3,
      sheepCount: 3,
      wolfCount: 3,
      obstaclesCount: 4,
      difficultyBonusFences: 1,
    };
  }
  if (levelId <= 10) {
    return {
      gridSize: 7,
      entrancesCount: 3,
      sheepCount: 3,
      wolfCount: 4,
      obstaclesCount: 4,
      difficultyBonusFences: 1,
    };
  }
  if (levelId <= 15) {
    return {
      gridSize: 7,
      entrancesCount: 3,
      sheepCount: 3,
      wolfCount: 4,
      obstaclesCount: 5,
      difficultyBonusFences: 0, // exact K fences for true puzzle challenge!
    };
  }
  // Endless high difficulty levels
  const gridSize = Math.min(8, 7 + Math.floor((levelId - 15) / 10));
  return {
    gridSize,
    entrancesCount: Math.min(4, 2 + (levelId % 3)),
    sheepCount: Math.min(4, 2 + Math.floor((levelId % 4))),
    wolfCount: Math.min(5, 3 + (levelId % 3)),
    obstaclesCount: Math.min(7, 3 + (levelId % 4)),
    difficultyBonusFences: 0,
  };
}

/**
 * Solves a candidate board using Max-Flow Min-Cut and validates solvability.
 */
export function solveCandidateBoard(
  gridSize: number,
  entrances: Entrance[],
  sheep: Position[],
  obstacles: Position[]
): { minFences: number; solutionFences: Edge[]; valid: boolean } {
  // Mapping cell (x, y) to node index
  const cellIndex = (x: number, y: number) => y * gridSize + x;
  const numCells = gridSize * gridSize;
  const SOURCE = numCells;
  const SINK = numCells + 1;

  const solver = new MinCutSolver(numCells + 2, SOURCE, SINK);
  const obstacleSet = new Set(obstacles.map(posKey));
  const sheepSet = new Set(sheep.map(posKey));
  const entranceSet = new Set(entrances.map(e => posKey({ x: e.x, y: e.y })));

  // Check if any sheep is on an entrance or obstacle
  for (const s of sheep) {
    if (entranceSet.has(posKey(s)) || obstacleSet.has(posKey(s))) {
      return { minFences: 0, solutionFences: [], valid: false };
    }
  }

  // Connect Source to all Entrance cells with infinite capacity
  for (const ent of entrances) {
    if (!obstacleSet.has(posKey({ x: ent.x, y: ent.y }))) {
      solver.addEdge(SOURCE, cellIndex(ent.x, ent.y), 1000);
    }
  }

  // Connect all Sheep cells to Sink with infinite capacity
  for (const s of sheep) {
    solver.addEdge(cellIndex(s.x, s.y), SINK, 1000);
  }

  // Connect adjacent grid cells with capacity 1 (one fence cut = 1 edge cut)
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (obstacleSet.has(posKey({ x, y }))) continue;

      const u = cellIndex(x, y);

      // Right neighbor
      if (x + 1 < gridSize && !obstacleSet.has(posKey({ x: x + 1, y }))) {
        const v = cellIndex(x + 1, y);
        const gridEdge: Edge = { x, y, orientation: 'v' };
        solver.addUndirectedGridEdge(u, v, 1, gridEdge);
      }

      // Bottom neighbor
      if (y + 1 < gridSize && !obstacleSet.has(posKey({ x, y: y + 1 }))) {
        const v = cellIndex(x, y + 1);
        const gridEdge: Edge = { x, y, orientation: 'h' };
        solver.addUndirectedGridEdge(u, v, 1, gridEdge);
      }
    }
  }

  const maxFlow = solver.solveMaxFlow();
  const solutionFences = solver.getMinCutEdges();

  // Solvability criteria:
  // 1. maxFlow > 0 (Without fences, at least one path exists, so it's not pre-solved)
  // 2. maxFlow >= 1 and maxFlow <= 12 (Reasonable fence puzzle)
  // 3. solutionFences must disconnect all entrances from sheep
  const isSeparated = !entrances.some(ent => {
    const path = findPathAStar({ x: ent.x, y: ent.y }, sheep, gridSize, obstacles, solutionFences);
    return path !== null;
  });

  return {
    minFences: maxFlow,
    solutionFences,
    valid: maxFlow > 0 && maxFlow <= 10 && isSeparated,
  };
}

/**
 * Procedural Generator with Guaranteed Solvability (Reverse-Solving / Min-Cut)
 */
export function generateProceduralLevel(levelId: number, customSeed?: number): LevelData {
  let attemptSeed = customSeed !== undefined ? customSeed : levelId * 7919 + 1337;
  const params = getParamsForLevel(levelId);

  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const rng = new SeededRandom(attemptSeed + attempt * 17);

    // 1. Generate Entrances around the perimeter
    // In screenshot, entrances are located at the bottom border ("Вход") with green arrows
    const entrances: Entrance[] = [];
    const availableBottomX = rng.shuffle(Array.from({ length: params.gridSize }, (_, i) => i));

    for (let i = 0; i < params.entrancesCount; i++) {
      const x = availableBottomX[i % availableBottomX.length];
      const y = params.gridSize - 1; // bottom edge
      entrances.push({
        id: `ent-${i + 1}`,
        side: 'bottom',
        x,
        y,
        label: `Вход ${i + 1}`,
      });
    }

    // 2. Generate Static Obstacles (stones, stumps)
    const allCells: Position[] = [];
    for (let y = 0; y < params.gridSize; y++) {
      for (let x = 0; x < params.gridSize; x++) {
        // Entrance cells cannot be obstacles
        const isEntrance = entrances.some(e => e.x === x && e.y === y);
        if (!isEntrance) {
          allCells.push({ x, y });
        }
      }
    }

    const shuffledCells = rng.shuffle(allCells);
    const obstacles: Position[] = [];
    const obstacleCount = Math.min(params.obstaclesCount, Math.floor(params.gridSize * 0.4));

    for (let i = 0; i < obstacleCount; i++) {
      obstacles.push(shuffledCells[i]);
    }

    // 3. Generate candidate Sheep positions
    const remainingCells = shuffledCells.slice(obstacleCount);
    // Prefer middle/upper pasture area for sheep so there is a nice path
    const candidateSheepCells = remainingCells.filter(c => c.y < params.gridSize - 1);
    const sheepPositions = rng.shuffle(candidateSheepCells).slice(0, params.sheepCount);

    if (sheepPositions.length < params.sheepCount) {
      continue; // Not enough spots, retry
    }

    // 4. Run Min-Cut Solver (Reverse-Solving)
    const solution = solveCandidateBoard(params.gridSize, entrances, sheepPositions, obstacles);

    if (solution.valid && solution.minFences >= 1) {
      // Check condition: without fences, wolves CAN reach sheep
      const unblockedPath = entrances.some(ent => {
        const path = findPathAStar({ x: ent.x, y: ent.y }, sheepPositions, params.gridSize, obstacles, []);
        return path !== null;
      });

      if (!unblockedPath) {
        continue; // Pre-blocked without fences, reject
      }

      const availableFences = solution.minFences + params.difficultyBonusFences;

      let difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'easy';
      if (levelId >= 11) difficulty = 'expert';
      else if (levelId >= 7) difficulty = 'hard';
      else if (levelId >= 3) difficulty = 'medium';

      return {
        id: levelId,
        seed: attemptSeed + attempt * 17,
        gridSize: params.gridSize,
        sheepCount: params.sheepCount,
        wolfCount: params.wolfCount,
        entrances,
        obstacles,
        availableFences,
        minFencesRequired: solution.minFences,
        initialSheepPositions: sheepPositions,
        solutionFences: solution.solutionFences,
        difficulty,
      };
    }
  }

  // Fallback safe level 1 if maxAttempts exceeded
  return {
    id: levelId,
    seed: 42,
    gridSize: 5,
    sheepCount: 2,
    wolfCount: 2,
    entrances: [
      { id: 'ent-1', side: 'bottom', x: 1, y: 4, label: 'Вход 1' },
      { id: 'ent-2', side: 'bottom', x: 3, y: 4, label: 'Вход 2' },
    ],
    obstacles: [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
    ],
    availableFences: 3,
    minFencesRequired: 2,
    initialSheepPositions: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    solutionFences: [
      { x: 1, y: 2, orientation: 'h' },
      { x: 2, y: 2, orientation: 'h' },
    ],
    difficulty: 'easy',
  };
}
