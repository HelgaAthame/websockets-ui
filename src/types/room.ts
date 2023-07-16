import type { Player } from "@/types";

export type Room = {
  roomId: number;
  roomUsers: Omit<Player, "password" | "active">[];
};
