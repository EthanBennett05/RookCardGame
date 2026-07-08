import { useState, type FormEvent } from "react";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";
import { sortHand, type SortMode } from "../Classes/handSort";
import type {
  SerializedCard,
  SerializedPlayer,
  SerializedBidding,
  SerializedTeam,
  RoundResult,
} from "../../types";
import { Scoreboard } from "../Components/scoreboard";
import { Hand } from "../Components/hand";
import { Card } from "../Components/Card";

const TRUMP_OPTIONS = ["red", "green", "black", "yellow"];

export function GameScene({ roomId, playerId }: { roomId: string; playerId: number }) {
  const { state, bid, pass, callTrump, playCard, discardCards, nextRound } =
    useMultiplayerGame(roomId, playerId);

  if (!state) {
    return (
      <div className="text-yellow-400 font-serif text-xl animate-pulse tracking-widest uppercase select-none">
        Connecting to game table...
      </div>
    );
  }

  const you = state.players.find((p) => p.id === playerId);
  const isYourTurn = state.currentPlayerId === playerId;
  const isBidder = state.bidding.highestBidderId === playerId;

  return (
    <div className="bg-gradient-to-b from-sky-900 to-sky-950 p-6 md:p-8 rounded-2xl w-full max-w-5xl space-y-6 border-4 border-yellow-400 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden select-none">
      {/* Iconic thin white inner box border line */}
      <div className="absolute inset-3 rounded-xl pointer-events-none" />

      {/* Table Top Scoreboard Container */}
      <div className="relative z-10 bg-neutral-950/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
        <Scoreboard teams={state.teams} />
      </div>

      {/* Main Interactive Table Felt Phase Display */}
      <div className="relative z-10 bg-neutral-950/50 p-6 rounded-xl border border-yellow-400/20 shadow-inner min-h-[14rem] flex flex-col justify-center items-center">
        {state.phase === "bidding" && (
          <BiddingPanel
            bidding={state.bidding}
            players={state.players}
            isYourTurn={state.bidding.activePlayerId === playerId}
            onBid={bid}
            onPass={pass}
          />
        )}

        {state.phase === "widow" && isBidder && (
          <WidowPanel
            hand={you?.hand ?? []}
            discardCount={state.discardCount}
            onDiscard={discardCards}
          />
        )}

        {state.phase === "widow" && !isBidder && (
          <p className="text-center text-sky-200/70 font-serif italic text-lg animate-pulse">
            Waiting for the bid winner to discard from the widow...
          </p>
        )}

        {state.phase === "trumpSelect" && (
          <TrumpPanel
            bidding={state.bidding}
            isYourTurn={isBidder}
            onCallTrump={callTrump}
          />
        )}

        {state.phase === "playing" && (
          <div className="w-full flex flex-col items-center space-y-4">
            <h3 className="text-xs font-barlow tracking-widest uppercase text-sky-300">
              Current Trick
            </h3>
            <div className="flex gap-4 min-h-[6rem] items-center justify-center bg-black/20 p-4 rounded-lg w-full max-w-2xl">
              {state.trick.map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-2 transform hover:scale-105 transition-transform">
                  <Card card={p.card} disabled />
                  <span className="text-xs font-medium text-yellow-400/90 tracking-wide">{p.player.name}</span>
                </div>
              ))}
            </div>
            <p className={`font-serif text-sm tracking-wide mt-2 ${isYourTurn ? "text-yellow-400 font-bold animate-bounce" : "text-sky-200/50 italic"}`}>
              {isYourTurn ? "◆ Your Turn To Play ◆" : "Waiting for other players..."}
            </p>
          </div>
        )}

        {state.phase === "roundOver" && (
          <RoundOverPanel
            roundResult={state.roundResult}
            teams={state.teams}
            onNextRound={nextRound}
          />
        )}
      </div>

      {/* Player Hand Tray */}
      <div className="relative z-10 bg-neutral-950/30 p-4 rounded-xl border border-white/5">
        <h3 className="text-xs font-barlow tracking-widest uppercase text-sky-300 mb-3 flex justify-between items-center px-1">
          <span>Your Player Hand</span>
          {state.trump && (
            <span className="text-yellow-400 font-serif normal-case tracking-normal text-sm font-bold">
              Trump: <span className="capitalize">{state.trump}</span>
            </span>
          )}
        </h3>
        <Hand
          cards={you?.hand ?? []}
          onPlayCard={(card: SerializedCard) => playCard(card)}
          disabled={state.phase !== "playing" || !isYourTurn}
          leadColor={state.leadColor}
          trump={state.trump}
        />
      </div>
    </div>
  );
}

// --- SUB PANEL COMPONENTS ---

function BiddingPanel({
  bidding,
  players,
  isYourTurn,
  onBid,
  onPass,
}: {
  bidding: SerializedBidding;
  players: SerializedPlayer[];
  isYourTurn: boolean;
  onBid: (amount: number) => void;
  onPass: () => void;
}) {
  const activePlayer = players.find((p) => p.id === bidding.activePlayerId);

  return (
    <div className="text-center space-y-3 w-full max-w-sm">
      <h2 className="text-3xl font-cormorant font-bold text-yellow-400 uppercase tracking-wider">Bidding Phase</h2>
      <p className="text-sm font-barlow tracking-widest uppercase text-sky-200">{activePlayer?.name}'s Turn</p>
      <div className="bg-black/30 py-2 px-4 rounded-lg inline-block text-xl font-serif text-amber-300 font-bold">
        {bidding.currentBid === null ? "No Bids Yet" : `Current Highest Bid: ${bidding.currentBid}`}
      </div>

      {isYourTurn ? (
        <BidForm key={bidding.minimumBid} minBid={bidding.minimumBid} onBid={onBid} onPass={onPass} />
      ) : (
        <p className="text-sky-200/50 italic text-sm pt-2">Waiting for {activePlayer?.name}...</p>
      )}
    </div>
  );
}

function BidForm({
  minBid,
  onBid,
  onPass,
}: {
  minBid: number;
  onBid: (amount: number) => void;
  onPass: () => void;
}) {
  const [amount, setAmount] = useState(minBid);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onBid(amount);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 justify-center items-center mt-4">
      <input
        type="number"
        value={amount}
        min={minBid}
        step={5}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-24 px-3 py-2 rounded border-2 border-sky-800 bg-white text-slate-900 font-mono font-bold text-center text-lg focus:outline-none focus:border-yellow-400"
      />
      <button
        type="submit"
        className="px-6 py-2 rounded bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-serif font-bold tracking-wide uppercase shadow-md transition-colors"
      >
        Bid
      </button>
      <button
        type="button"
        onClick={onPass}
        className="px-5 py-2 rounded bg-sky-950 hover:bg-sky-900 border border-white/20 text-white font-serif font-bold tracking-wide uppercase shadow-md transition-colors"
      >
        Pass
      </button>
    </form>
  );
}

function WidowPanel({
  hand,
  discardCount,
  onDiscard,
}: {
  hand: SerializedCard[];
  discardCount: number;
  onDiscard: (discards: { color: string; number: string }[]) => void;
}) {
  const [selected, setSelected] = useState<SerializedCard[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("color");

  function isSameCard(a: SerializedCard, b: SerializedCard) {
    return a.color === b.color && a.number === b.number;
  }

  function toggle(card: SerializedCard) {
    setSelected((prev) => {
      if (prev.some((c) => isSameCard(c, card))) {
        return prev.filter((c) => !isSameCard(c, card));
      }
      if (prev.length >= discardCount) return prev;
      return [...prev, card];
    });
  }

  function submit() {
    if (selected.length !== discardCount) return;
    onDiscard(selected.map((c) => ({ color: c.color, number: c.number })));
  }

  const sorted = sortHand(hand, sortMode);

  return (
    <div className="text-center space-y-4 w-full">
      <h2 className="text-3xl font-cormorant font-bold text-yellow-400 uppercase tracking-wider">The Widow</h2>
      <p className="text-sky-200 tracking-wide text-sm">
        Select <span className="font-bold text-yellow-400">{discardCount}</span> cards to discard into the vault ({selected.length}/{discardCount})
      </p>

      <div className="flex gap-2 justify-center text-xs">
        <button
          onClick={() => setSortMode("color")}
          className={`px-3 py-1 rounded ${sortMode === "color" ? "bg-yellow-400 text-neutral-950 font-bold" : "bg-sky-950 text-white border border-white/20"}`}
        >
          Sort by color
        </button>
        <button
          onClick={() => setSortMode("number")}
          className={`px-3 py-1 rounded ${sortMode === "number" ? "bg-yellow-400 text-neutral-950 font-bold" : "bg-sky-950 text-white border border-white/20"}`}
        >
          Sort by number
        </button>
      </div>

      <div className="flex gap-2 flex-wrap justify-center py-2">
        {sorted.map((card, i) => (
          <div key={`${card.color}-${card.number}-${i}`} className="transition-transform duration-150 transform hover:-translate-y-1">
            <Card
              card={card}
              onClick={() => toggle(card)}
              selected={selected.some((c) => isSameCard(c, card))}
            />
          </div>
        ))}
      </div>
      <button
        onClick={submit}
        disabled={selected.length !== discardCount}
        className="px-6 py-2.5 rounded bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-serif font-bold tracking-wider uppercase transition-all shadow-md disabled:opacity-30 disabled:pointer-events-none"
      >
        Discard & Continue
      </button>
    </div>
  );
}

function TrumpPanel({
  bidding,
  isYourTurn,
  onCallTrump,
}: {
  bidding: SerializedBidding;
  isYourTurn: boolean;
  onCallTrump: (trump: string) => void;
}) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-3xl font-cormorant font-bold text-yellow-400 uppercase tracking-wider">Bid Won ({bidding.currentBid})</h2>
      {isYourTurn ? (
        <>
          <p className="text-sky-200 font-serif italic">Call the primary trump suit for this round:</p>
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            {TRUMP_OPTIONS.map((color) => {
              const colorMap: Record<string, string> = {
                red: "bg-red-600 hover:bg-red-500 text-white",
                green: "bg-emerald-700 hover:bg-emerald-600 text-white",
                black: "bg-neutral-900 hover:bg-neutral-800 text-yellow-400 border border-yellow-400/30",
                yellow: "bg-yellow-400 hover:bg-yellow-300 text-neutral-950",
              };
              return (
                <button
                  key={color}
                  onClick={() => onCallTrump(color)}
                  className={`px-6 py-2 rounded font-serif font-bold text-sm tracking-widest uppercase transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-md ${colorMap[color] || 'bg-slate-600'}`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sky-200/50 italic text-sm animate-pulse">Waiting for the highest bidder to declare trump...</p>
      )}
    </div>
  );
}

function RoundOverPanel({
  roundResult,
  teams,
  onNextRound,
}: {
  roundResult: RoundResult | null;
  teams: SerializedTeam[];
  onNextRound: () => void;
}) {
  if (!roundResult) return null;
  const biddingTeam = teams.find((t) => t.id === roundResult.biddingTeamId);

  return (
    <div className="text-center space-y-4 max-w-md">
      <h2 className="text-3xl font-cormorant font-bold text-yellow-400 uppercase tracking-widest">Round Complete</h2>
      <div className="bg-black/20 p-4 rounded-xl space-y-2">
        <p className="text-lg tracking-wide">
          <span className="font-serif font-bold text-amber-300">{biddingTeam?.name}</span> bid <span className="font-mono">{roundResult.bidAmount}</span>
        </p>
        <p className="text-xl">
          Scored: <span className="font-serif font-black">{roundResult.pointsScored} pts</span>
        </p>
        <div className="pt-2">
          {roundResult.madeBid ? (
            <span className="px-4 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-400 font-serif font-bold text-sm uppercase tracking-widest">
              Success — Made Bid
            </span>
          ) : (
            <span className="px-4 py-1 rounded bg-red-950 border border-red-500 text-red-400 font-serif font-bold text-sm uppercase tracking-widest">
              Set — Down (-{roundResult.bidAmount})
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onNextRound}
        className="px-6 py-3 rounded bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-serif font-bold text-lg tracking-wide uppercase transition-all shadow-lg w-full"
      >
        Start Next Round
      </button>
    </div>
  );
}