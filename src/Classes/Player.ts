import { Card } from "./Card";

export class Player {
    id: number;
    name: string;
    hand: Card[];
    teamId: number;

    constructor(id: number, name: string, teamId: number, hand: Card[] = []) {
        this.id = id;
        this.name = name;
        this.teamId = teamId;
        this.hand = hand;
    }


    playCard(card: Pick<Card, "color" | "number">): Card | undefined {
        const index = this.hand.findIndex(
            (c) => c.color === card.color && c.number === card.number
        );

        if (index === -1) return undefined;

        return this.hand.splice(index, 1)[0];
    }
}