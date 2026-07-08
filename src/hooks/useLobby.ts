// hooks/useLobby.ts
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { LobbyPlayer } from "../../types";

export function useLobby(roomId: string, playerId: number) {
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", { roomId, playerId });
    });

    socket.on("lobbyState", ({ players }: { players: LobbyPlayer[] }) => {
      setPlayers(players);
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, playerId]);

  function chooseTeam(team: 1 | 2) {
    socketRef.current?.emit("chooseTeam", { roomId, playerId, team });
  }

  function startGame() {
    socketRef.current?.emit("startGame", { roomId });
  }

  return { players, gameStarted, chooseTeam, startGame };
}