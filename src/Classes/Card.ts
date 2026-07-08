import type { Player } from "./Player";

export class Card {
    color: string;
    number: string;
    value: number;
    points: number;

    constructor(color: string, number: string, value: number, points: number) {
        this.color = color;
        this.number = number;
        this.value = value;
        this.points = points;
    }

    toString():string {
        if (this.color === "Rook"){
            if (this.value === 20) {
                return `Rook`
            }
            else {
                return `Little Rook`
            }
        }
        else {
            return `${this.color} ${this.number}`
        }
    };
}

export type PlayedCard = {
    card: Card;
    player: Player;
}