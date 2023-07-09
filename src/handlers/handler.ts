import {dataBase} from "../dataBase/dataBase.js";

export const dataHandler = (message: string) => {
  const data = JSON.parse(message);
  console.log(`Command: ${data.type}`);
  let result;
  switch (data.type) {
    case "reg":
      result = dataBase.reg(data.data);
      break;
  }
  return result;
};
