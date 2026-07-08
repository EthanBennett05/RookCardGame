import { Card } from "./Card";
import { Player } from "./Player";

const WIDOW_SIZE = 6;

export class Deck {
    cards: Card[];

    constructor(cards: Card[] = []){
        this.cards = cards;
    }

    get count(): number {
        return this.cards.length;
    }


    static createDeck() {
        const deck = new Deck();
        const colors = ["red", "green", "black", "yellow"];
        colors.forEach((color) => {
            for (let value = 5; value < 15; value++) {
            deck.cards.push(
                new Card(color, value.toString(), value, deck.pointsForValue(value))
            )
            }
        });
        deck.cards.push(new Card("Rook", "Rook", 20, 20));
        deck.cards.push(new Card("Rook", "Little Rook", 19, 20));

        return deck;
}

private pointsForValue(value: number): number {
  if (value === 5) return 5;
  if (value === 10 || value === 14) return 10;
  return 0;
}

    shuffle(){
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    };

    draw(): Card | undefined {
        return this.cards.pop();
    }

    dealCards(players: Player[], widowSize: number = WIDOW_SIZE): Card[] {
        this.shuffle();
        const widow: Card[] = [];
        for (let i = 0; i < widowSize; i++) {
        const card = this.draw();
        if (card) widow.push(card);
        }

        let current = 0;
        while (this.count > 0) {
        const card = this.draw();
        if (!card) break;
        players[current].hand.push(card);
        current = (current + 1) % players.length;
        }
        return widow;
    }
};

