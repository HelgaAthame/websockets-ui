import { WebSocketServer, WebSocket, createWebSocketStream } from "ws";
import { httpServer } from "@/http_server/index.js";

const HTTP_PORT = process.env.HTTP_PORT || 8181;
const WS_PORT = Number(process.env.WS_PORT || 3000);
import { dataHandler } from "@/handlers/handler.js";
import { ClientType } from "@/types/client.js";
import { id } from "./src/helpers/uuid.js";
import { dataBase } from "./src/dataBase/dataBase.js";

httpServer.listen(HTTP_PORT, () => {
  console.log(`Start static http server on the ${HTTP_PORT} port!`);
});

export class CustomWebsocket extends WebSocket {
  id = id()
}

const wss = new WebSocketServer({
  port: WS_PORT,
  WebSocket: CustomWebsocket
});

let botIndex: number | undefined;
let finished: boolean = false;

wss.on("listening", () => {
  console.log(`Start websocket server on the ${WS_PORT} port!`);
});


wss.on("connection", async (ws) => {
  const stream = createWebSocketStream(
    ws, 
    { 
      decodeStrings: false
    }
  );

  if (botIndex) {
    console.log(`New ws BOT with ID ${ws.id} connected`);
    const botHost = Array.from(wss.clients.values()).find((client) => Number(client.id) === botIndex);
    const roomId = await addActiveGameWithBot(ws.id);
    if (botHost) botHost.send(
      JSON.stringify(createResponse('create_game', { idGame: roomId, idPlayer: botHost.id }))
    );
    botIndex = undefined;
  } else {
    console.log(`New ws client with ID ${ws.id} connected!`);
  }

  dataBase.addClient(ws);

  ws.on("error", (err) => {
    console.error(err);
  });

  /*ws.on("message", (data) => {
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
  });*/
  stream.on('data', async (data) => {
    const reqbody: reqbody = JSON.parse(data);
    console.log(reqbody);

    /* Registration request */
    if (reqbody.type === "reg") {
      const respBody = await regUser(reqbody, ws.id);
      stream.write(JSON.stringify(respBody));
      stream.write(JSON.stringify(createResponse('update_room', getUpdateRoomData())));
      stream.write(JSON.stringify(createResponse('update_winners', getUpdateWinnersData())));
    }

    /* Create room request */
    if (reqbody.type === "create_room") {
      const respBody = await updateRoom(ws.id);
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(respBody));
      });
    }

    /* Add user to room request */
    if (reqbody.type === 'add_user_to_room') {
      const respBody = await createGame(reqbody, ws.id);
      if (respBody) {
        const roomId = Number(respBody.data);
        const room = dataBase.getRoomByRoomId(roomId);
        if (room && room.roomUsers.length === 2) {
          dataBase.deleteRoom(roomId);
          wss.clients.forEach((client) => {
            client.send(JSON.stringify(createResponse('update_room', getUpdateRoomData())));
            if (room.roomUsers.some((player) => player.index === client.id)) {
              respBody.data = JSON.stringify(getCreateGameData(roomId, client.id));
              client.send(JSON.stringify(respBody));
            }
          });
        }
      }
    }

    /* Add ships request */
    if (reqbody.type === ReqType.ADD_SHIPS) {
      const sentShipsCounter = checkGameShipsCounter(reqbody);
      if (sentShipsCounter === 2) {
        const respBody = startGame(reqbody, ws.id);
        let turnSent = 0;
        let counter = 0;

        const currentGame = dataBase.getActiveGameByPlayerIndex(ws.id);
        if (!currentGame) return;

        wss.clients.forEach((client) => {
          if (currentGame.players.some((player) => player.index === client.id)) {
            client.send(JSON.stringify(respBody));
            counter++;
            if ((Math.random() > 0.5 || counter > 1) && !turnSent) {
              dataBase.setActiveGameTurn(currentGame, client.id);
              client.send(JSON.stringify(createResponse('turn', getTurnData(client.id))));
              turnSent = client.id;
            }
          }
        });
        counter = 0;

        /* If game with bot and bot goes first - send bot turn and autoattack */
        const bot = currentGame.players.find((player) => player.index !== ws.id && player.isBot);
        const botWS: WebSocketWithId | undefined = [...wss.clients.values()].find(
          (client) => client.id === bot?.index
        );
        if (botWS && turnSent === botWS.id) {
          const botAttackRes: respBody[] | undefined = await attack(
            createBotAttack(currentGame.gameId, botWS.id)
          );
          wss.clients.forEach((client) => {
            if (currentGame.players.some((player) => player.index === client.id)) {
              if (botAttackRes) {
                botAttackRes.forEach((item) => {
                  client.send(JSON.stringify(item));
                });
              }
            }
          });
        }
        turnSent = 0;
      }
    }

    /* Attack request */
    if (reqbody.type === 'attack' || reqbody.type === 'randomAttack') {
      const respBody = await attack(reqbody);
      if (!respBody) return;

      const currentGame = dataBase.getActiveGameByPlayerIndex(ws.id);
      if (!currentGame) return;

      wss.clients.forEach((client) => {
        if (currentGame.players.some((player) => player.index === client.id)) {
          respBody.forEach((item) => {
            client.send(JSON.stringify(item));
          });
          if (currentGame.finished) {
            client.send(JSON.stringify(createResponse('finish', getFinishData(currentGame.turn))));
          } else {
            client.send(JSON.stringify(createResponse('turn', getTurnData(currentGame.turn))));
          }
        }
      });

      /* Check if game is with bot and if it is bot's turn */
      const bot = currentGame.players.find((player) => player.index !== ws.id && player.isBot);
      const botWS: CustomWebsocket | undefined = [...wss.clients.values()].find(
        (client) => client.id === bot?.index
      );

      if (botWS && currentGame.turn === botWS.id && !currentGame.finished) {
        const botAttackRes = await attack(createBotAttack(currentGame.gameId, botWS.id));
        wss.clients.forEach((client) => {
          if (botAttackRes) {
            botAttackRes.forEach((item) => {
              client.send(JSON.stringify(item));
            });
          }
        });
      }

      /* When game is finished */
      if (currentGame.finished) {
        finished = true;
        dataBase.deleteActiveGame(currentGame);

        /* Delete bot from dataBase and from ws connections after the game */
        if (botWS) {
          dataBase.deletePlayerByIndex(botWS.id);
          botWS.close();
        }
      }
    }

    /* Single play request */
    if (reqbody.type === 'single_play') {
      new WebSocket(`ws://${HOST}:${WS_PORT}`);
      botIndex = ws.id;
    }

    if (finished) {
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(createResponse('update_winners', getUpdateWinnersData())));
      });
      finished = false;
    }
  });

  ws.on("close", () => {
    dataBase.deleteRoom(ws.id);
    dataBase.toggleActivePlayer(ws.id, false);
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(createResponse('update_room', getUpdateRoomData())));
    });

    console.log(`Client with id ${ws.id} disconnected`);
  });
});

process.on('SIGINT', () => {
  setImmediate(() => process.exit(0));
});
