import { dataBase } from '@/dataBase';
import type { ResponseBody } from '@/types';
import { createResponse, getUpdateRoomData } from '@/handlers';

export const updateRoom = async (currentPlayerId: number): Promise<ResponseBody> => {
  const currentPlayer = dataBase.getPlayerByIndex(currentPlayerId);
  const isUserInAnyRoom = dataBase.isUserInAnyRoom(currentPlayerId);
  if (!isUserInAnyRoom && currentPlayer) {
    dataBase.addRoom(currentPlayer);
  }

  return createResponse('update_room', getUpdateRoomData());
};
