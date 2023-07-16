import type {RequestBody, ResponseBody} from "../types";
import {dataBase} from "../dataBase";

export const createGame = async (parsedBody: RequestBody, idPlayer: number) => {
  const idGame = (await JSON.parse(parsedBody.data).indexRoom) as number;

  const isUserARoomHost = dataBase.isUserARoomHost(idGame, idPlayer);

  if (isUserARoomHost) return;

  dataBase.addPlayerToRoom(idGame, idPlayer);
  dataBase.addActiveGame(idGame);

  const res: ResponseBody = {
    type: "create_game",
    data: idGame.toString(),
    id: 0,
  };

  return res;
};
