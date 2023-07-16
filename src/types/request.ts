type ReqType =
  | "reg"
  | "create_room"
  | "add_user_to_room"
  | "add_ships"
  | "attack"
  | "single_play"
  | "randomAttack";

export type RequestBody = {
  type: ReqType;
  data: string;
  id: 0;
};
