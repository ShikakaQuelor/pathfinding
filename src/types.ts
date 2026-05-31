export interface GridNode {
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
  isVisited: boolean;
  isShortest: boolean;
  previousNode: GridNode | null;
  distance: number;
  f: number;
}

export type Grid = GridNode[][];
