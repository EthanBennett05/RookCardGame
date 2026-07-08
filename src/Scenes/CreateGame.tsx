export function CreateGame({
  playerName,
  setPlayerName,
  onCreated,
}: {
  playerName: string;
  setPlayerName: (name: string) => void;
  onCreated: (roomId: string, playerId: number) => void;
}) {

  async function createGame() {
  try {
    const res = await fetch("http://localhost:3001/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName }),
    });
    if (!res.ok) {
      console.error("[CreateGame] server responded with error:", res.status);
      return;
    }
    const { roomId, playerId } = await res.json();
    console.log("[CreateGame] room created:", roomId, playerId);
    onCreated(roomId, playerId);
  } catch (err) {
    console.error("[CreateGame] fetch failed:", err);
  }
}

  return (
    <div className="bg-gradient-to-b from-sky-900 to-sky-950 p-8 md:p-12 rounded-2xl w-full max-w-xl space-y-6 border-4 border-yellow-400 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Iconic thin white inner border line */}
      <div className="absolute rounded-xl pointer-events-none" />

      <h1 className="text-4xl md:text-5xl select-none cursor-default text-yellow-400 text-center font-black tracking-wider uppercase font-cormorant drop-shadow-md relative z-10">
        Create Game
      </h1>

      <div className="space-y-4 relative z-10 max-w-sm mx-auto">
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded border-2 border-sky-800 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-400 font-medium shadow-inner"
        />

        <button
          onClick={createGame}
          className="w-full py-3 md:py-4 rounded bg-neutral-950 hover:bg-neutral-900 text-yellow-400 font-serif font-bold text-lg border border-yellow-400 tracking-wider uppercase transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg active:translate-y-0"
        >
          Create
        </button>
      </div>
    </div>
  );
}