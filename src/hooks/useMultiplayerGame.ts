// hooks/useMultiplayerGame.ts
import { useEffect, useState, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { GameState, SerializedCard } from "../../types";

export function useMultiplayerGame(roomId: string, playerId: number) {
  const [state, setState] = useState<GameState | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log("[client] connecting to server...", { roomId, playerId });
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[client] socket connected:", socket.id);
      socket.emit("joinRoom", { roomId, playerId });
      console.log("[client] emitted joinRoom", { roomId, playerId });
    });

    socket.on("connect_error", (err) => {
      console.error("[client] connect_error:", err.message);
    });

    socket.on("error", (msg) => {
      console.error("[client] server error event:", msg);
    });

    socket.on("gameState", (newState: GameState) => {
      console.log("[client] received gameState:", newState);
      setState(newState);
    });

    return () => {
      console.log("[client] disconnecting");
      socket.disconnect();
    };
  }, [roomId, playerId]);

  function bid(amount: number) {
    console.log("[client] emitting bid", amount);
    socketRef.current?.emit("bid", { roomId, playerId, amount });
  }

  function pass() {
    console.log("[client] emitting pass");
    socketRef.current?.emit("pass", { roomId, playerId });
  }

  function callTrump(trump: string) {
    console.log("[client] emitting callTrump", trump);
    socketRef.current?.emit("callTrump", { roomId, playerId, trump });
  }

  function playCard(card: SerializedCard) {
    console.log("[client] emitting playCard", card);
    socketRef.current?.emit("playCard", { roomId, playerId, card });
  }

  function discardCards(discards: { color: string; number: string }[]) {
    console.log("[client] emitting discardCards", discards);
    socketRef.current?.emit("discardCards", { roomId, playerId, discards });
  }

  function nextRound() {
    console.log("[client] emitting nextRound");
    socketRef.current?.emit("nextRound", { roomId, playerId });
  }

  return { state, bid, pass, callTrump, playCard, discardCards, nextRound };
}