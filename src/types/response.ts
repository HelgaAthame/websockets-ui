export type RespType = 
|'reg'
|'create_game'
|'update_winners'
|'update_room'
|'start_game'
|'attack'
|'turn'
|'finish'

export type ResponseBody = {
  type: RespType;
  data: string;
  id: 0;
};