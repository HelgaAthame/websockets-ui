import * as fs from 'fs';
import * as path from 'path';
import { httpServer } from '../http_server/index.js';
import { WebSocketServer } from 'ws';
import { env } from 'process';

const port = Number(env.HTTP_PORT || 8181);

const wss = new WebSocketServer({ port });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

