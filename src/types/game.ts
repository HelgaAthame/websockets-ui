import type {ShipField} from "./ship";

export type ActiveGame = {
  finished: boolean;
  turn: number;
  gameId: number;
  sentShipsCounter: 0 | 1 | 2;
  players: {
    index: number;
    isBot?: boolean;
    shipField: ShipField;
    hittedFields: {x: number; y: number}[];
  }[];
};
