import { useState, useEffect } from "react";
import { CreateGame } from "./CreateGame";
import { JoinGame } from "./JoinGame";
import { TeamSelect } from "./TeamSelect";
import type { LobbyPlayer } from "../../types";
import { useLobby } from "../hooks/useLobby";

type LobbyStep = "home" | "create" | "join" | "teams";

export function Lobby({
  onStart,
}: {
  onStart: (roomId: string, playerId: number) => void;
}) {
  const [step, setStep] = useState<LobbyStep>("home");

  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [playerId, setPlayerId] = useState(0);

  const [players, setPlayers] = useState<LobbyPlayer[]>([]);

  function enterTeam(team: 1 | 2) {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId
          ? { ...player, team }
          : player
      )
    );
  }

  if (step === "create") {
    return (
      <CreateGame
        playerName={playerName}
        setPlayerName={setPlayerName}
        onCreated={(room, id) => {
          setRoomId(room);
          setPlayerId(id);

          setPlayers([
            {
              id,
              name: playerName,
              team: 1,
              isHost: true,
            },
          ]);

          setStep("teams");
        }}
      />
    );
  }

  if (step === "join") {
    return (
      <JoinGame
        playerName={playerName}
        setPlayerName={setPlayerName}
        onJoined={(room, id) => {
          setRoomId(room);
          setPlayerId(id);

          setPlayers([
            {
              id,
              name: playerName,
              team: null,
              isHost: false,
            },
          ]);

          setStep("teams");
        }}
      />
    );
  }

  if (step === "teams") {
    return (
      <TeamsStep roomId={roomId} playerId={playerId} onGameStart={() => onStart(roomId, playerId)} />
    );
  }

  // --- HOME / MAIN MENU STEP ---
  return (
    <div className="bg-gradient-to-b from-sky-900 to-sky-950 p-8 md:p-12 rounded-2xl w-full max-w-xl space-y-8 border-4 border-yellow-400 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden select-none cursor-default">
      {/* Iconic thin white inner border line */}
      <div className="absolute inset-3 rounded-xl pointer-events-none" />

      {/* Brand style Rook Header - Highly Responsive Scaling */}
      <h1 className="text-6xl md:text-7xl lg:text-8xl text-yellow-400 text-center font-black tracking-widest uppercase font-cormorant drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] relative z-10 py-4">
        Rook
      </h1>

      <div className="space-y-4 relative z-10 max-w-sm mx-auto">
        {/* Main Action Button (Create) */}
        <button
          onClick={() => setStep("create")}
          className="w-full py-3 md:py-4 rounded bg-neutral-950 hover:bg-neutral-900 text-yellow-400 font-serif font-bold text-lg md:text-xl border border-yellow-400 tracking-wider uppercase transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg active:translate-y-0"
        >
          Create Game
        </button>

        {/* Secondary Action Button (Join) */}
        <button
          onClick={() => setStep("join")}
          className="w-full py-3 md:py-4 rounded bg-sky-950/60 hover:bg-sky-900/80 text-white font-serif font-bold text-lg md:text-xl border border-white/30 tracking-wider uppercase transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg active:translate-y-0"
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

function TeamsStep({
  roomId,
  playerId,
  onGameStart,
}: {
  roomId: string;
  playerId: number;
  onGameStart: () => void;
}) {
  const { players, gameStarted, chooseTeam, startGame } = useLobby(roomId, playerId);

  useEffect(() => {
    if (gameStarted) onGameStart();
  }, [gameStarted]);

  return (
    <TeamSelect
      roomId={roomId}
      playerId={playerId}
      players={players}
      onJoinTeam={chooseTeam}
      onStart={startGame}
    />
  );
}