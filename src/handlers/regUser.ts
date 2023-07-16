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
      throw Error(errors.ERR_USER_IS_ALREADY_LOGGED_IN);
    }

    if (player.password !== password) {
      throw Error(errors.ERR_INCORRECT_PASSWORD);
    }
    dataBase.toggleActivePlayer(player.index, true);
    dataBase.updatePlayerIndex(name, index);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === errors.ERR_USER_DOES_NOT_EXIST) {
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
