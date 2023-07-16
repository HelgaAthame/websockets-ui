import {dataBase} from "@/dataBase";
import type {ResRegData, Player, RequestBody, ResponseBody} from "@/types";

export const regUser = async (parsedBody: RequestBody, index: number) => {
  const {name, password}: Omit<Player, "index" | "active"> = await JSON.parse(
    parsedBody.data
  );
  let error = false,
    errorText = "";

  try {
    const player = dataBase.getPlayerByName(name);
    if (player.active) {
      throw Error('User with such username already logged in');
    }

    if (player.password !== password) {
      throw Error('The password is not correct');
    }
    dataBase.toggleActivePlayer(player.index, true);
    dataBase.updatePlayerIndex(name, index);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'User with such username doesn\'t exist') {
        dataBase.addPlayer({name, password, index, isBot: false});
      } else {
        error = true;
        errorText = e.message;
      }
    }
  }

  const res: ResponseBody = {
    type: "reg",
    data: JSON.stringify({name, index, error, errorText} as ResRegData),
    id: 0,
  };

  return res;
};
