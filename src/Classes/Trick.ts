import type { PlayedCard } from "./Card";
import { Card } from "./Card";

export class Trick {
  plays: PlayedCard[] = [];
  trump: string;

  constructor(trump: string) {
    this.trump = trump;
  }

  addPlay(play: PlayedCard) {
    this.plays.push(play);
  }

        get leadColor(): string | null {
        return this.plays.length > 0 ? this.plays[0].card.color : null;
    }


        get effectiveLeadColor(): string | null {
            const raw = this.leadColor;
            if (raw === "Rook") return this.trump;
            return raw;
        }

  scoreTrick(): { winner: PlayedCard; points: number } | null {
    if (this.plays.length === 0) return null;

    let highest = this.plays[0];
    let points = 0;

    const isRook = (c: Card) => c.color === "Rook";

    for (const play of this.plays) {
      const card = play.card;

      points += card.points;

      // Rook always wins
      if (isRook(card) && !isRook(highest.card)) {
        highest = play;
        continue;
      }

      if (!isRook(card) && isRook(highest.card)) {
        continue;
      }

      // Trump logic
      const isTrump = (c: Card) => c.color === this.trump;

      if (isTrump(card) && !isTrump(highest.card)) {
        highest = play;
        continue;
      }

      if (!isTrump(card) && isTrump(highest.card)) {
        continue;
      }

      // Same suit
      if (card.color === highest.card.color) {
        if (card.value > highest.card.value) {
          highest = play;
        }
      }
    }

    return {
      winner: highest,
      points,
    };
  }
}
