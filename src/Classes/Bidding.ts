import { Player } from "./Player";

const MINIMUM_BID = 80;

export class Bidding {
  players: Player[];
  currentPlayer: number;
  currentBid: number | null = null; // null until someone actually bids
  highestBidder: Player | null = null;
  passes = new Set<number>();
  isComplete = false;

  constructor(players: Player[], startingPlayerIndex: number = 0) {
    this.players = players;
    this.currentPlayer = startingPlayerIndex;
  }

  get activePlayer(): Player {
    return this.players[this.currentPlayer];
  }

  get minimumBid(): number {
    return this.currentBid === null ? MINIMUM_BID : this.currentBid + 5;
  }

  nextPlayer() {
    do {
      this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    } while (this.passes.has(this.activePlayer.id));
  }

  placeBid(amount: number): boolean {
    const player = this.activePlayer;

    if (amount < this.minimumBid) return false;

    this.currentBid = amount;
    this.highestBidder = player;
    this.nextPlayer();
    return true;
  }

  pass() {
    this.passes.add(this.activePlayer.id);
    if (this.passes.size === this.players.length - 1) {
      this.isComplete = true;
      return;
    }
    this.nextPlayer();
  }
}