import type { SerializedCard } from "../../types";

function countsAsSuit(card: SerializedCard, suit: string, trump: string): boolean {
  if (card.color === suit) return true;
  if (suit === trump && card.color === "Rook") return true;
  return false;
}

export function isCardPlayable(
  hand: SerializedCard[],
  leadColor: string | null,
  trump: string,
  card: SerializedCard
): boolean {
  const effectiveLeadColor = leadColor === "Rook" ? trump : leadColor;
  if (!effectiveLeadColor) return true;

  const followsSuit = countsAsSuit(card, effectiveLeadColor, trump);
  const hasSuit = hand.some((c) => countsAsSuit(c, effectiveLeadColor, trump));

  return followsSuit || !hasSuit;
}