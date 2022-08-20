const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
let connections = [];
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("new-user-add", (newUserId) => {
    console.log(newUserId);
    if (!connections.some((user) => user.userId === newUserId)) {
      connections.push({
        latitude: newUserId.latitude,
        longitude: newUserId.longitude,
        socketId: socket.id,
        active: true,
        userId: newUserId.userId,
      });
    }
    io.emit("get-users", connections);
  });

  socket.on("get-online-users", () => {
    io.emit("get-users", connections);
  });

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    connections = connections.filter((user) => user.socketId !== socket.id);

    io.emit("get-users", connections);
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3018, () => {
  console.log("SERVER RUNNING");
});
