import { useState } from "react";

export function JoinGame({
  playerName,
  setPlayerName,
  onJoined,
}: {
  playerName: string;
  setPlayerName: (name: string) => void;
  onJoined: (roomId: string, playerId: number) => void;
}) {
  const [roomCode, setRoomCode] = useState("");

  async function joinGame() {
    if (!roomCode.trim()) {
      alert("Enter a room code"); 
      return;
    }
    const res = await fetch(`http://localhost:3001/rooms/${roomCode.trim().toUpperCase()}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName }),
    });
    if (!res.ok) return; 
    const { roomId, playerId } = await res.json();
    onJoined(roomId, playerId);
  }

  return (
    <div className="bg-gradient-to-b from-sky-900 to-sky-950 p-8 md:p-12 rounded-2xl w-full max-w-xl space-y-6 border-4 border-yellow-400 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden select-none cursor-default">
      {/* Iconic thin white inner box border line */}
      <div className="absolute inset-3 rounded-xl pointer-events-none" />

      <h1 className="text-4xl md:text-5xl text-yellow-400 text-center font-black tracking-wider uppercase font-cormorant drop-shadow-md relative z-10">
        Join Game
      </h1>

      <div className="space-y-4 relative z-10 max-w-sm mx-auto">
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded border-2 border-sky-800 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-400 font-medium shadow-inner"
        />

        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Room Code"
          className="w-full px-4 py-3 rounded border-2 border-sky-800 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-400 font-mono font-bold uppercase tracking-widest text-center"
        />

        <button
          onClick={joinGame}
          className="w-full py-3 md:py-4 rounded bg-neutral-950 hover:bg-neutral-900 text-yellow-400 font-serif font-bold text-lg border border-yellow-400 tracking-wider uppercase transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg active:translate-y-0"
        >
          Join Match
        </button>
      </div>
    </div>
  );
}