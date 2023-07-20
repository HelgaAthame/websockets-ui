import type { Ship } from './ship';

export type ResData =
  | ResRegData
  | ResUpdateRoomData
  | ResUpdateWinnersData
  | ResUpdateRoomData
  | ResCreateGameData
  | ResStartGameData
  | ResAttackData
  | ResTurnData
  | ResFinishData;

export type ResRegData = {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
};

export type ResUpdateWinnersData = {
  name: string;
  wins: number;
}[];

export type ResUpdateRoomData = { roomId: number; roomUsers: { name: string; index: number }[] }[];

export type ResCreateGameData = {
  idGame: number;
  idPlayer: number;
};

export type ResStartGameData = {
  ships: Ship[];
  currentPlayerIndex: number;
};

export type ResAttackData = {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number;
  status: 'miss' | 'killed' | 'shot';
};

export type ResTurnData = {
  currentPlayer: number;
};

export type ResFinishData = {
  winPlayer: number;
};