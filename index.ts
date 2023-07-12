import { WebSocketServer } from "ws";
import { httpServer } from "./src/http_server/index.js";

const HTTP_PORT = process.env.HTTP_PORT || 8181;
const WS_PORT = Number(process.env.WS_PORT || 3000);
import { dataHandler } from "./src/handlers/handler.js";
import { ClientType } from "./src/types/client.js";
import { id } from "./src/helpers/uuid.js";
import { dataBase } from "./src/dataBase/dataBase.js";

httpServer.listen(HTTP_PORT, () => {
  console.log(`Start static http server on the ${HTTP_PORT} port!`);
});

const wss = new WebSocketServer({
  port: WS_PORT,
});

wss.on("listening", () => {
  console.log(`Start websocket server on the ${WS_PORT} port!`);
});


wss.on("connection", (ws: ClientType) => {
  console.log('New ws client connected!');

  ws.index = id();
  dataBase.addClient(ws);

  ws.on("error", (err) => {
    console.error(err);
  });

  ws.on("message", (data) => {
    const stringified = data.toString();
    try {
      const result = dataHandler(stringified);
      if (result) {
        const resStrngfd = JSON.stringify(result);
        console.log(resStrngfd);
        ws.send(resStrngfd);
      }
    } catch (err) {
      console.error(err);
    }
  });

  ws.on("close", () => {
    // we are to handle websocket was closed
  });
});
