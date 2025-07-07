const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// --- Simple in-memory room/queue management ---
const rooms = {};
let quickQueue = [];

function createRoom() {
  return Math.random().toString(36).slice(2, 8);
}

io.on('connection', (socket) => {
  let joinedRoom = null;
  console.log('client connected');

  socket.on('quickplay:join', () => {
    quickQueue.push(socket);
    if (quickQueue.length >= 2) {
      const roomId = createRoom();
      rooms[roomId] = { players: [] };
      const players = quickQueue.splice(0, 2);
      players.forEach((s) => {
        s.join(roomId);
        rooms[roomId].players.push(s.id);
        s.emit('room:joined', { roomId });
      });
    }
  });

  socket.on('room:join', (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = { players: [] };
    joinedRoom = roomId;
    socket.join(roomId);
    rooms[roomId].players.push(socket.id);
    socket.emit('room:joined', { roomId });
    socket.to(roomId).emit('player:joined', { id: socket.id });
  });

  socket.on('state:update', (payload) => {
    if (!joinedRoom) return;
    socket.to(joinedRoom).emit('state:update', payload);
  });

  socket.on('disconnect', () => {
    if (joinedRoom && rooms[joinedRoom]) {
      rooms[joinedRoom].players = rooms[joinedRoom].players.filter(
        (id) => id !== socket.id
      );
      socket.to(joinedRoom).emit('player:left', { id: socket.id });
      if (rooms[joinedRoom].players.length === 0) {
        delete rooms[joinedRoom];
      }
    } else {
      // remove from quick queue if pending
      quickQueue = quickQueue.filter((s) => s !== socket);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
