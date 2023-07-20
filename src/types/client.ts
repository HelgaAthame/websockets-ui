import WebSocket from "ws";

export interface ClientType extends WebSocket {
  id: number;
}
