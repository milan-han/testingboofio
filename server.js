const http = require('http');
const WebSocket = require('ws');
const RoomState = require('./js/room-state.js');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

function broadcastState() {
  const snapshot = RoomState.getState();
  const msg = JSON.stringify({ type: 'state', state: snapshot });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'state', state: RoomState.getState() }));

  ws.on('message', message => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      return;
    }
    if (data.type === 'state') {
      RoomState.replaceState(data.state || {});
      broadcastState();
    }
  });
});

server.listen(3000, () => {
  console.log('WebSocket server listening on port 3000');
});
