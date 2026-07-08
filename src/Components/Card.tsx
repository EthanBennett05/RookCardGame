// src/Components/Card.tsx
import type { SerializedCard } from "../../types";

const COLOR_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-300" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-300" },
  black: { bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-400" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-300" },
  Rook: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-400" },
};

type CardProps = {
  card: SerializedCard;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  faceDown?: boolean;
};

export function Card({ card, onClick, disabled, selected, faceDown }: CardProps) {
  if (faceDown) {
    return (
      <div className="w-16 h-24 rounded-lg border-2 border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 shadow-md" />
    );
  }

  const style = COLOR_STYLES[card.color] ?? COLOR_STYLES.black;
  const isRook = card.color === "Rook";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-16 h-24 rounded-lg border-2 shadow-md flex flex-col items-center justify-between p-1.5
        transition-transform duration-150
        ${style.bg} ${style.border}
        ${!disabled ? "hover:-translate-y-2 hover:shadow-lg cursor-pointer" : "opacity-40 cursor-not-allowed"}
        ${selected ? "-translate-y-2 ring-2 ring-emerald-400" : ""}
      `}
    >
      <span className={`text-lg font-bold ${style.text}`}>
        {isRook ? "★" : card.number}
      </span>
      <span className={`text-[10px] uppercase tracking-wide ${style.text}`}>
        {isRook ? card.number : card.color}
      </span>
      {card.points > 0 && (
        <span className={`text-[9px] ${style.text} opacity-70`}>
          {card.points}pt
        </span>
      )}
    </button>
  );
}