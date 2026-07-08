import type { Player } from "./Player";

export class Team {
    id: number;
    name: string;
    score: number;
    roundScore: number;
    players: Player[];

    constructor(id: number = 0, name: string = "", players: Player[] = []) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.roundScore = 0;
        this.players = players;
    }

    addRoundPoints(points: number) {
        this.roundScore += points;
    }

    resetRound() {
        this.roundScore = 0;
    }
}