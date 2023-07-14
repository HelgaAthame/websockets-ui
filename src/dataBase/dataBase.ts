import { CustomWebsocket } from "../../index.js";
import { ClientType } from "../types/client.js";

type User = {
  name: string;
  password: string;
  index: number;
};

type Room = {
  id: string;
  users: User[];
};

type RegInput = {
  name: string;
  password: string;
};

type RegOutput = {
  type: string;
  data: string;
  id: number;
};

class db {
  users: User[];
  rooms: Room[];
  clients: CustomWebsocket[];
  constructor() {
    this.users = [];
    this.rooms = [];
    this.clients = [];
  }

  reg(data: string): RegOutput {
    const parsed = JSON.parse(data);
    const userInDb: User | undefined = this.users.find(
      (user) => user.name === parsed.name
    );
    let result = {
      name: "",
      index: -1,
      error: false,
      errorText: "",
    };
    if (userInDb) {
      if (userInDb.password === parsed.password) {
        result.name = userInDb.name;
        result.index = userInDb.index;
        console.log("Result: user is logged in");
      } else {
        result.error = true;
        result.errorText = "Password is incorrect";
        console.log("Result: error - password is incorrect");
      }
    } else {
      const ind = this.users.length;
      this.users.push({
        name: parsed.name,
        password: parsed.password,
        index: ind,
      });
      result.name = parsed.name;
      result.index = ind;
      console.log("Result: user is created");
    }
    return {
      type: "reg",
      data: JSON.stringify(result),
      id: 0,
    };
  }

  addClient (client: CustomWebsocket) {
    this.clients.push(client);
  }

  createRoom () {
    const newRoom = {
    }
  }
}

export const dataBase = new db();
