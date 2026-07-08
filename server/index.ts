import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { GameRoom } from "./GameRoom";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const rooms = new Map<string, GameRoom>();

app.post("/rooms", (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = new GameRoom(roomId, req.body.playerName);
  rooms.set(roomId, room);
  res.json({ roomId, playerId: 0 });
});

app.post("/rooms/:id/join", (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  const playerId = room.addPlayer(req.body.playerName);
  res.json({ roomId: req.params.id, playerId });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Single join event used for BOTH lobby and in-game — one flow, one socket map
  socket.on("joinRoom", ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }
    room.join(playerId, socket);
  });

  socket.on("chooseTeam", ({ roomId, playerId, team }) => {
    rooms.get(roomId)?.setTeam(playerId, team);
  });

  socket.on("startGame", ({ roomId }) => {
    rooms.get(roomId)?.startGame();
  });

  socket.on("bid", ({ roomId, playerId, amount }) => {
    rooms.get(roomId)?.handleBid(playerId, amount);
  });

  socket.on("pass", ({ roomId, playerId }) => {
    rooms.get(roomId)?.handlePass(playerId);
  });

  socket.on("discardCards", ({ roomId, playerId, discards }) => {
    rooms.get(roomId)?.handleDiscard(playerId, discards);
  });

  socket.on("callTrump", ({ roomId, playerId, trump }) => {
    rooms.get(roomId)?.handleCallTrump(playerId, trump);
  });

  socket.on("playCard", ({ roomId, playerId, card }) => {
    rooms.get(roomId)?.handlePlayCard(playerId, card);
  });

  socket.on("nextRound", ({ roomId, playerId }) => {
    rooms.get(roomId)?.handleNextRound(playerId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

httpServer.listen(3001, () => console.log("Server running on 3001"));