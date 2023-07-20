import {dataBase} from "../dataBase";
import {calculateShipField, createRandomShipsForBot} from "../handlers";
import type {Ship} from "./../types";

export const addActiveGameWithBot = async (botId: number) => {
  const ships = (await createRandomShipsForBot()) as Ship[];

  const roomId = Math.floor(Math.random() * 1000);

  dataBase.addPlayer({
    name: `bot_${botId}`,
    password: "",
    index: botId,
    isBot: true,
  });
  dataBase.addActiveGame(roomId);

  dataBase.updateActiveGameById(roomId, botId, calculateShipField(ships));
  return roomId;
};
