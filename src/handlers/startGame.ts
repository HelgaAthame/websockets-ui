import type {Ship} from "../types";
import {createResponse} from "../handlers";

export const startGame = (parsedBody: any, currentPlayerIndex: number) => {
  const ships = JSON.parse(parsedBody.data) as Ship[];

  return createResponse("start_game", {ships, currentPlayerIndex});
};
