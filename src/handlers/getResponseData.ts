import type {
  ResCreateGameData,
  ResFinishData,
  ResTurnData,
  ResUpdateRoomData,
  ResUpdateWinnersData,
} from '@/types';
import { dataBase } from '@/dataBase';

export const getFinishData = (winPlayer: number): ResFinishData => ({
  winPlayer,
});

export const getTurnData = (currentPlayer: number): ResTurnData => ({
  currentPlayer,
});

export const getUpdateRoomData = (): ResUpdateRoomData => dataBase.rooms;
export const getUpdateWinnersData = (): ResUpdateWinnersData => dataBase.winners;
export const getCreateGameData = (idGame: number, idPlayer: number): ResCreateGameData => ({
  idGame,
  idPlayer,
});
