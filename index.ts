import ws, {WebSocketServer, WebSocket, createWebSocketStream} from "ws";
import {httpServer} from "@/http_server/index.js";

const HTTP_PORT = process.env.HTTP_PORT || 8181;
const WS_PORT = Number(process.env.WS_PORT || 3000);

import {id} from "./src/helpers/uuid.js";
import {dataBase} from "./src/dataBase/dataBase.js";
import {ResponseBody, RequestBody} from "@/types";
import {
  addActiveGameWithBot,
  checkGameShipsCounter,
  createGame,
  createResponse,
  getCreateGameData,
  getFinishData,
  getTurnData,
  getUpdateRoomData,
  getUpdateWinnersData,
  regUser,
  updateRoom,
} from "@/handlers";

httpServer.listen(HTTP_PORT, () => {
  console.log(`Start static http server on the ${HTTP_PORT} port!`);
});

export class CustomWebsocket extends WebSocket {
  id = id();
}

const wss = new WebSocketServer({
  port: WS_PORT,
  WebSocket: CustomWebsocket,
});

let botIndex: number | undefined;
let finished: boolean = false;

wss.on("listening", () => {
  console.log(`Start websocket server on the ${WS_PORT} port!`);
});

wss.on("connection", async (ws) => {
  const stream = createWebSocketStream(ws, {
    decodeStrings: false,
  });

  if (botIndex) {
    console.log(`New ws BOT with ID ${ws.id} connected`);
    const botHost = Array.from(wss.clients.values()).find(
      (client) => Number(client.id) === botIndex
    );
    const roomId = await addActiveGameWithBot(ws.id);
    if (botHost)
      botHost.send(
        JSON.stringify(
          createResponse("create_game", {idGame: roomId, idPlayer: botHost.id})
        )
      );
    botIndex = undefined;
  } else {
    console.log(`New ws client with ID ${ws.id} connected!`);
  }

  ws.on("error", (err) => {
    console.error(err);
  });

  stream.on("data", async (data) => {
    const reqbody: RequestBody = JSON.parse(data);
    console.log(reqbody);
    let respBody: ResponseBody;
    switch (reqbody.type) {
      case "reg":
        respBody = await regUser(reqbody, ws.id);
        stream.write(JSON.stringify(respBody));
        stream.write(
          JSON.stringify(createResponse("update_room", getUpdateRoomData()))
        );
        stream.write(
          JSON.stringify(
            createResponse("update_winners", getUpdateWinnersData())
          )
        );
        break;
      case "create_room":
        respBody = await updateRoom(ws.id);
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(respBody));
        });
        break;
      case "add_user_to_room":
        respBody = await createGame(reqbody, ws.id);
        if (respBody) {
          const roomId = Number(respBody.data);
          const room = dataBase.getRoomByRoomId(roomId);
          if (room && room.roomUsers.length === 2) {
            dataBase.deleteRoom(roomId);
            wss.clients.forEach((client) => {
              client.send(
                JSON.stringify(
                  createResponse("update_room", getUpdateRoomData())
                )
              );
              if (room.roomUsers.some((player) => player.index === client.id)) {
                respBody.data = JSON.stringify(
                  getCreateGameData(roomId, client.id)
                );
                client.send(JSON.stringify(respBody));
              }
            });
          }
        }
        break;
      case "add_ships":const sentShipsCounter = checkGameShipsCounter(reqbody);
      if (sentShipsCounter === 2) {
        const respBody = startGame(reqbody, ws.id);
        let turnSent = 0;
        let counter = 0;
        const currentGame = dataBase.getActiveGameByPlayerIndex(ws.id);
        if (!currentGame) return;

        wss.clients.forEach((client) => {
          if (
            currentGame.players.some((player) => player.index === client.id)
          ) {
            client.send(JSON.stringify(respBody));
            counter++;
            if ((Math.random() > 0.5 || counter > 1) && !turnSent) {
              dataBase.setActiveGameTurn(currentGame, client.id);
              client.send(
                JSON.stringify(createResponse("turn", getTurnData(client.id)))
              );
              turnSent = client.id;
            }
          }
        });
        counter = 0;
        const bot = currentGame.players.find(
          (player) => player.index !== ws.id && player.isBot
        );
        const botWS:CustomWebsocket | undefined = [
          ...wss.clients.values(),
        ].find((client) => client.id === bot?.index);
        if (botWS && turnSent === botWS.id) {
          const botAttackRes: ResponseBody[] | undefined = await attack(
            createBotAttack(currentGame.gameId, botWS.id)
          );
          wss.clients.forEach((client) => {
            if (
              currentGame.players.some((player) => player.index === client.id)
            ) {
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
        break;
      case "single_play":
        new WebSocket(`ws://localhost:${WS_PORT}`);
        botIndex = ws.id;
        break;
      case "attack" || "randomAttack":
        respBody = await attack(reqbody);
        if (!respBody) return;
        const currentGame = dataBase.getActiveGameByPlayerIndex(ws.id);
        if (!currentGame) return;
        wss.clients.forEach((client) => {
          if (currentGame.players.some((player) => player.index === client.id)) {
            respBody.forEach((item) => {
              client.send(JSON.stringify(item));
            });
            if (currentGame.finished) {
              client.send(
                JSON.stringify(
                  createResponse("finish", getFinishData(currentGame.turn))
                )
              );
            } else {
              client.send(
                JSON.stringify(
                  createResponse("turn", getTurnData(currentGame.turn))
                )
              );
            }
          }
        });
        const bot = currentGame.players.find(
          (player) => player.index !== ws.id && player.isBot
        );
        const botWS: CustomWebsocket | undefined = [...wss.clients.values()].find(
          (client) => client.id === bot?.index
        );

        if (botWS && currentGame.turn === botWS.id && !currentGame.finished) {
          const botAttackRes = await attack(
            createBotAttack(currentGame.gameId, botWS.id)
          );
          wss.clients.forEach((client) => {
            if (botAttackRes) {
              botAttackRes.forEach((item) => {
                client.send(JSON.stringify(item));
              });
            }
          });
        }
        if (currentGame.finished) {
          finished = true;
          dataBase.deleteActiveGame(currentGame);
          if (botWS) {
            dataBase.deletePlayerByIndex(botWS.id);
            botWS.close();
          }
        }
        break;
      default:
        console.log("Incorrect command type");
        break;
    }

    if (finished) {
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify(
            createResponse("update_winners", getUpdateWinnersData())
          )
        );
      });
      finished = false;
    }
  });

  ws.on("close", () => {
    dataBase.deleteRoom(ws.id);
    dataBase.toggleActivePlayer(ws.id, false);
    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify(createResponse("update_room", getUpdateRoomData()))
      );
    });

    console.log(`Client with id ${ws.id} disconnected`);
  });
});

process.on("SIGINT", () => {
  setImmediate(() => process.exit(0));
});
