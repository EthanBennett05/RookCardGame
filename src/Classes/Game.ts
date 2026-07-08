import { Deck } from "./Deck";
import { Team } from "./Team";
import { Player } from "./Player";
import type { Card } from "./Card";
import { Trick } from "./Trick";
import { Bidding } from "./Bidding";

export type GamePhase = "bidding" | "widow" | "trumpSelect" | "playing" | "roundOver";

export type RoundResult = {
  biddingTeamId: number;
  bidAmount: number;
  pointsScored: number;
  madeBid: boolean;
};

export class Game {
  cards: Deck;
  teams: Team[];
  players: Player[];
  trick: Trick;
  trump: string;
  bidding: Bidding;
  widow: Card[] = [];
  widowPoints: number = 0;
  currentTurn: number;
  phase: GamePhase;
  normalHandSize: number = 0;
  lastRoundResult: RoundResult | null = null;
  dealerIndex: number = -1; // advances by 1 each round; -1 so first startRound() lands on 0

  constructor(players: Player[], teams: Team[]) {
    this.players = players;
    this.teams = teams;
    this.cards = Deck.createDeck();
    this.trick = new Trick("");
    this.trump = "";
    this.bidding = new Bidding(players);
    this.currentTurn = 0;
    this.phase = "bidding";
  }

  startRound() {
    this.cards = Deck.createDeck();
    this.widow = this.cards.dealCards(this.players);
    this.normalHandSize = this.players[0]?.hand.length ?? 0;

    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
    this.bidding = new Bidding(this.players, this.dealerIndex);

    this.trump = "";
    this.widowPoints = 0;
    this.lastRoundResult = null;
    this.phase = "bidding";
  }

  pickUpWidow() {
    const bidder = this.bidding.highestBidder;
    if (!bidder) return;
    bidder.hand.push(...this.widow);
    this.widow = [];
    this.phase = "widow";
  }

  // Bidder discards back down to normalHandSize. Points on the discarded
  // cards are banked and awarded to whoever wins the LAST trick of the round.
  discardCards(player: Player, discards: { color: string; number: string }[]) {
    if (player !== this.bidding.highestBidder) return;

    let discardedPoints = 0;
    for (const d of discards) {
      const idx = player.hand.findIndex((c) => c.color === d.color && c.number === d.number);
      if (idx !== -1) {
        discardedPoints += player.hand[idx].points;
        player.hand.splice(idx, 1);
      }
    }

    this.widowPoints = discardedPoints;
    this.phase = "trumpSelect";
  }

  callTrump(trump: string) {
    this.trump = trump;
    this.trick = new Trick(trump);
    this.currentTurn = this.players.indexOf(this.bidding.highestBidder!);
    this.phase = "playing";
  }

  get currentPlayer(): Player {
    return this.players[this.currentTurn];
  }

  private countsAsSuit(card: { color: string }, suit: string, trump: string): boolean {
    if (card.color === suit) return true;
    if (suit === trump && card.color === "Rook") return true;
    return false;
  }

  playCard(player: Player, card: { color: string; number: string }): boolean {
    if (player !== this.currentPlayer) return false;

    const cardInHand = player.hand.find(
      (c) => c.color === card.color && c.number === card.number
    );
    if (!cardInHand) return false;

    const leadColor = this.trick.effectiveLeadColor;

    if (leadColor) {
      const followsSuit = this.countsAsSuit(cardInHand, leadColor, this.trump);
      const hasSuit = player.hand.some((c) => this.countsAsSuit(c, leadColor, this.trump));

      if (!followsSuit && hasSuit) return false; // must follow suit (Rook counts as trump)
    }

    const played = player.playCard(cardInHand);
    if (!played) return false;

    this.trick.addPlay({ card: played, player });

    if (this.trick.plays.length === this.players.length) {
      this.finishTrick();
    } else {
      this.currentTurn = (this.currentTurn + 1) % this.players.length;
    }

    return true;
  }

  private finishTrick() {
    const result = this.trick.scoreTrick();

    if (result) {
      const winningTeam = this.teams.find(
        (t) => t.id === result.winner.player.teamId
      );

      winningTeam?.addRoundPoints(result.points);
      this.currentTurn = this.players.indexOf(result.winner.player);

      if (this.isRoundOver()) {
        winningTeam?.addRoundPoints(this.widowPoints);
        this.widowPoints = 0;
        this.settleRound();
      }
    }

    this.trick = new Trick(this.trump);
  }

  private settleRound() {
    const bidder = this.bidding.highestBidder;
    const biddingTeamId = bidder?.teamId;
    // currentBid is guaranteed non-null here: settleRound only ever runs
    // after a round finished playing, which requires bidding to have
    // completed with a winning bid already placed.
    const bidAmount = this.bidding.currentBid ?? 0;

    let pointsScored = 0;
    let madeBid = false;

    for (const team of this.teams) {
      if (team.id === biddingTeamId) {
        pointsScored = team.roundScore;
        madeBid = team.roundScore >= bidAmount;
        team.score += madeBid ? team.roundScore : -bidAmount;
      } else {
        team.score += team.roundScore;
      }
      team.resetRound();
    }

    this.lastRoundResult = {
      biddingTeamId: biddingTeamId ?? -1,
      bidAmount,
      pointsScored,
      madeBid,
    };

    this.phase = "roundOver";
  }

  isRoundOver(): boolean {
    return this.players.every((p) => p.hand.length === 0);
  }
}