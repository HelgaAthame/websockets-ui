import { dataBase } from "../dataBase/dataBase.js";

export const dataHandler = (message: string) => {
  const data = JSON.parse(message);
  console.log(`Command: ${data.type}`);
  let result;
  switch (data.type) {
    case "reg":
      result = dataBase.reg(data.data);
      break;
    case "create_game":
      break;
    case "start_game":
      break;
    case "turn":
      break;
    case "attack":
      break;
    case "finish":
      break;
    case "update_room":
      break;
    case "update_winners":
      break;
    default:
      console.log('Incorrect command type');
      break;
  }
  return result;
};
