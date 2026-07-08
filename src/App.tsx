// src/App.tsx
import { useState } from "react";
import { Lobby } from "./Scenes/Lobby";
import { GameScene } from "./Scenes/GameScene";

export default function App() {
  const [session, setSession] = useState<{ roomId: string; playerId: number } | null>(null);

  return (
<div className="min-h-screen bg-radial from-slate-800 via-slate-900 to-neutral-950 text-white flex items-center justify-center p-4 antialiased selection:bg-yellow-400 selection:text-black">
    {!session ? (
        <Lobby onStart={(roomId, playerId) => setSession({ roomId, playerId })} />
      ) : (
        <GameScene roomId={session.roomId} playerId={session.playerId} />
      )}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center select-none opacity-40 hover:opacity-80 transition-opacity duration-300">
        <p className="font-barlow text-sm uppercase tracking-[0.25em] text-slate-400">
          Built By Ethan Bennett
        </p>
        <p className="font-barlow text-sm text-yellow-400/90 tracking-wide mt-0.5">
          Not for trademark just for fun
        </p>
      </footer>
    </div>
  );
}