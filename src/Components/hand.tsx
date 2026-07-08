import { useState } from "react";
import { Card } from "./Card";
import { sortHand, type SortMode } from "../Classes/handSort";
import { isCardPlayable } from "../Classes/cardRules";
import type { SerializedCard } from "../../types";

type HandProps = {
  cards: SerializedCard[];
  onPlayCard: (card: SerializedCard) => void;
  disabled?: boolean;
  leadColor?: string | null;
  trump?: string;
};

export function Hand({ cards, onPlayCard, disabled = false, leadColor = null, trump = "" }: HandProps) {
  const [sortMode, setSortMode] = useState<SortMode>("color");
  const sorted = sortHand(cards, sortMode, trump);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setSortMode("color")}
          className={`px-2 py-1 rounded ${sortMode === "color" ? "bg-emerald-500 text-slate-900" : "bg-slate-700"}`}
        >
          Sort by color
        </button>
        <button
          onClick={() => setSortMode("number")}
          className={`px-2 py-1 rounded ${sortMode === "number" ? "bg-emerald-500 text-slate-900" : "bg-slate-700"}`}
        >
          Sort by number
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {sorted.map((card, i) => {
          const playable = disabled ? false : isCardPlayable(cards, leadColor, trump, card);
          return (
            <Card
              key={`${card.color}-${card.number}-${i}`}
              card={card}
              onClick={() => onPlayCard(card)}
              disabled={!playable}
            />
          );
        })}
      </div>
    </div>
  );
}