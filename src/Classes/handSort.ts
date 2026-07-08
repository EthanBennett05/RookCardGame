import type { SerializedCard } from "../../types";

export type SortMode = "color" | "number";

const BASE_COLORS = ["black", "red", "yellow", "green"];

function getColorOrder(trump: string): string[] {
  const others = BASE_COLORS.filter((c) => c !== trump);
  return trump ? [trump, ...others] : BASE_COLORS;
}

export function sortHand(hand: SerializedCard[], mode: SortMode, trump: string = ""): SerializedCard[] {
  const rooks = hand.filter((c) => c.color === "Rook");
  const rest = hand.filter((c) => c.color !== "Rook");

  // Rook and Little Rook always come first, Rook (20) before Little Rook (19)
  rooks.sort((a, b) => b.value - a.value);

  if (mode === "color") {
    const order = getColorOrder(trump);
    rest.sort((a, b) => {
      const colorDiff = order.indexOf(a.color) - order.indexOf(b.color);
      return colorDiff !== 0 ? colorDiff : b.value - a.value;
    });
  } else {
    rest.sort((a, b) => b.value - a.value);
  }

  return [...rooks, ...rest];
}