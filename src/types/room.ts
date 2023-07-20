import type {Player} from "./player";

export type Room = {
  roomId: number;
  roomUsers: Omit<Player, "password" | "active">[];
};
