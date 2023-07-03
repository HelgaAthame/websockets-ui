
import { websocketServer} from "./src/websocket_server/index.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
websocketServer.listen(HTTP_PORT);
