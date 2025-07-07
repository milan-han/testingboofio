const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
  console.log('client connected');
  socket.on('room:update', (data) => {
    socket.broadcast.emit('room:update', data);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
