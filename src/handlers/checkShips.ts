import {dataBase} from "@/dataBase";
import {calculateShipField} from "@/handlers";
import type {RequestBody} from "@/types";

export const checkGameShipsCounter = (parsedBody: RequestBody) => {
  const {gameId, indexPlayer, ships} = JSON.parse(parsedBody.data);
  const activeGame = dataBase.updateActiveGameById(
    gameId,
    indexPlayer,
    calculateShipField(ships)
  );
  if (activeGame) return activeGame.sentShipsCounter;
};
