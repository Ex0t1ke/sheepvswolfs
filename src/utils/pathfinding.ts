import { Position, Edge } from '../types';

export function edgeKey(edge: Edge): string {
  return `${edge.x},${edge.y},${edge.orientation}`;
}

export function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function arePositionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Checks if there is a fence blocking movement between two adjacent cells (c1 and c2).
 */
export function isMoveBlockedByFence(c1: Position, c2: Position, fences: Edge[]): boolean {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;

  // Horizontal movement (dx = 1 or -1)
  if (dx === 1 && dy === 0) {
    // Moving right: blocked if vertical fence at (c1.x, c1.y)
    return fences.some(f => f.orientation === 'v' && f.x === c1.x && f.y === c1.y);
  }
  if (dx === -1 && dy === 0) {
    // Moving left: blocked if vertical fence at (c2.x, c2.y)
    return fences.some(f => f.orientation === 'v' && f.x === c2.x && f.y === c2.y);
  }

  // Vertical movement (dy = 1 or -1)
  if (dy === 1 && dx === 0) {
    // Moving down: blocked if horizontal fence at (c1.x, c1.y)
    return fences.some(f => f.orientation === 'h' && f.x === c1.x && f.y === c1.y);
  }
  if (dy === -1 && dx === 0) {
    // Moving up: blocked if horizontal fence at (c2.x, c2.y)
    return fences.some(f => f.orientation === 'h' && f.x === c2.x && f.y === c2.y);
  }

  return false;
}

/**
 * Returns valid adjacent cells in the grid, taking obstacles and fences into account.
 */
export function getValidNeighbors(
  pos: Position,
  gridSize: number,
  obstacles: Position[],
  fences: Edge[]
): Position[] {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  const obstacleSet = new Set(obstacles.map(posKey));
  const neighbors: Position[] = [];

  for (const dir of directions) {
    const next: Position = { x: pos.x + dir.x, y: pos.y + dir.y };

    // Within grid bounds?
    if (next.x < 0 || next.x >= gridSize || next.y < 0 || next.y >= gridSize) {
      continue;
    }

    // Static obstacle?
    if (obstacleSet.has(posKey(next))) {
      continue;
    }

    // Blocked by fence between pos and next?
    if (isMoveBlockedByFence(pos, next, fences)) {
      continue;
    }

    neighbors.push(next);
  }

  return neighbors;
}

/**
 * Manhattan distance heuristic for A*
 */
function manhattan(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * A* search to find shortest path from start to the closest target in `targets`.
 * Returns array of Positions from start to target (inclusive), or null if unreachable.
 */
export function findPathAStar(
  start: Position,
  targets: Position[],
  gridSize: number,
  obstacles: Position[],
  fences: Edge[]
): Position[] | null {
  if (targets.length === 0) return null;

  const targetKeys = new Set(targets.map(posKey));
  const startK = posKey(start);

  if (targetKeys.has(startK)) {
    return [start];
  }

  interface Node {
    pos: Position;
    g: number;
    h: number;
    f: number;
    parent?: Node;
  }

  function minHeuristic(pos: Position): number {
    let minH = Infinity;
    for (const t of targets) {
      const h = manhattan(pos, t);
      if (h < minH) minH = h;
    }
    return minH;
  }

  const openSet: Node[] = [];
  const openMap = new Map<string, Node>();
  const closedSet = new Set<string>();

  const startNode: Node = {
    pos: start,
    g: 0,
    h: minHeuristic(start),
    f: minHeuristic(start),
  };

  openSet.push(startNode);
  openMap.set(startK, startNode);

  while (openSet.length > 0) {
    // Extract node with lowest f
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const curKey = posKey(current.pos);
    openMap.delete(curKey);
    closedSet.add(curKey);

    // Reached any target?
    if (targetKeys.has(curKey)) {
      // Reconstruct path
      const path: Position[] = [];
      let temp: Node | undefined = current;
      while (temp) {
        path.unshift(temp.pos);
        temp = temp.parent;
      }
      return path;
    }

    const neighbors = getValidNeighbors(current.pos, gridSize, obstacles, fences);
    for (const neighbor of neighbors) {
      const nKey = posKey(neighbor);
      if (closedSet.has(nKey)) continue;

      const tentativeG = current.g + 1;
      const existing = openMap.get(nKey);

      if (!existing) {
        const h = minHeuristic(neighbor);
        const neighborNode: Node = {
          pos: neighbor,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current,
        };
        openSet.push(neighborNode);
        openMap.set(nKey, neighborNode);
      } else if (tentativeG < existing.g) {
        existing.g = tentativeG;
        existing.f = tentativeG + existing.h;
        existing.parent = current;
      }
    }
  }

  return null;
}

/**
 * Generate a patrol & exit path when the wolf cannot reach any sheep.
 * The wolf will patrol the reachable area, explore nearest perimeter cells,
 * and finally head to the exit (e.g. exitPos or origin entrance).
 */
export function generatePatrolAndExitPath(
  startPos: Position,
  exitPos: Position,
  gridSize: number,
  obstacles: Position[],
  fences: Edge[]
): Position[] {
  // BFS flood-fill to find all reachable cells from startPos
  const visited = new Set<string>();
  const queue: { pos: Position; path: Position[] }[] = [{ pos: startPos, path: [startPos] }];
  visited.add(posKey(startPos));

  const reachableCells: Position[] = [startPos];

  while (queue.length > 0) {
    const { pos } = queue.shift()!;
    const neighbors = getValidNeighbors(pos, gridSize, obstacles, fences);
    for (const neighbor of neighbors) {
      const k = posKey(neighbor);
      if (!visited.has(k)) {
        visited.add(k);
        reachableCells.push(neighbor);
        queue.push({ pos: neighbor, path: [] });
      }
    }
  }

  // Pick up to 3-5 distinct wandering points to simulate sniffing around fences
  // Sort reachable cells by distance or edge proximity to fences
  const path: Position[] = [startPos];
  let current = startPos;

  // Find candidate interest points (e.g. cells adjacent to fences)
  const interestPoints: Position[] = [];
  for (const cell of reachableCells) {
    if (!arePositionsEqual(cell, startPos) && !arePositionsEqual(cell, exitPos)) {
      // Is it near a fence?
      const directions = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
      const hasFenceNeighbor = directions.some(dir => isMoveBlockedByFence(cell, { x: cell.x + dir.x, y: cell.y + dir.y }, fences));
      if (hasFenceNeighbor) {
        interestPoints.push(cell);
      }
    }
  }

  // Shuffle interest points deterministically or pick 2
  const chosenPoints = interestPoints.slice(0, 3);
  if (chosenPoints.length === 0 && reachableCells.length > 1) {
    chosenPoints.push(reachableCells[Math.floor(reachableCells.length / 2)]);
  }

  // Build path from current -> each chosen point -> exitPos
  for (const pt of chosenPoints) {
    const subPath = findPathAStar(current, [pt], gridSize, obstacles, fences);
    if (subPath && subPath.length > 1) {
      // Append excluding the starting node
      for (let i = 1; i < subPath.length; i++) {
        path.push(subPath[i]);
      }
      current = pt;
    }
  }

  // Finally, path back to exitPos
  const exitSubPath = findPathAStar(current, [exitPos], gridSize, obstacles, fences);
  if (exitSubPath && exitSubPath.length > 1) {
    for (let i = 1; i < exitSubPath.length; i++) {
      path.push(exitSubPath[i]);
    }
  } else if (!arePositionsEqual(current, exitPos)) {
    // If exitPos is unreachable (e.g. blocked), just exit to startPos
    const backToStart = findPathAStar(current, [startPos], gridSize, obstacles, fences);
    if (backToStart && backToStart.length > 1) {
      for (let i = 1; i < backToStart.length; i++) {
        path.push(backToStart[i]);
      }
    }
  }

  return path;
}
