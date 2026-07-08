import { Game } from "../src/Classes/Game";
import { Player } from "../src/Classes/Player";
import { Team } from "../src/Classes/Team";
import type { Card } from "../src/Classes/Card";
import type { Socket } from "socket.io";
import type { LobbyPlayer } from "../types";

export class GameRoom {
  id: string;
  players: LobbyPlayer[] = [];
  sockets: Map<number, Socket> = new Map();
  game: Game | null = null;

  constructor(id: string, hostName: string) {
    this.id = id;
    this.players.push({ id: 0, name: hostName, team: 1, isHost: true });
  }

  addPlayer(name: string) {
    const id = this.players.length;
    this.players.push({ id, name, team: null, isHost: false });
    return id;
  }

  join(playerId: number, socket: Socket) {
    this.sockets.set(playerId, socket);
    if (this.game) {
      socket.emit("gameStarted");
      socket.emit("gameState", this.serializeFor(playerId));
    } else {
      this.broadcastLobby();
    }
  }

  setTeam(playerId: number, team: 1 | 2) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;
    player.team = team;
    this.broadcastLobby();
  }

  startGame() {
    const gamePlayers = this.players.map(
      (p) => new Player(p.id, p.name, p.team === 1 ? 0 : 1)
    );
    const teams = [new Team(0, "Team 1"), new Team(1, "Team 2")];

    this.game = new Game(gamePlayers, teams);
    this.game.startRound();

    for (const [playerId, socket] of this.sockets) {
      socket.emit("gameStarted");
      socket.emit("gameState", this.serializeFor(playerId));
    }
  }

  handleBid(playerId: number, amount: number): boolean {
    if (!this.game) return false;
    if (this.game.bidding.activePlayer.id !== playerId) return false;
    const accepted = this.game.bidding.placeBid(amount);
    if (accepted) this.afterBiddingAction();
    return accepted;
  }

  handlePass(playerId: number) {
    if (!this.game) return;
    if (this.game.bidding.activePlayer.id !== playerId) return;
    this.game.bidding.pass();
    this.afterBiddingAction();
  }

  private afterBiddingAction() {
    if (!this.game) return;
    if (this.game.bidding.isComplete && this.game.phase === "bidding") {
      this.game.pickUpWidow();
    }
    this.broadcastState();
  }

  handleDiscard(playerId: number, discards: { color: string; number: string }[]) {
    if (!this.game) return;
    const player = this.game.players.find((p) => p.id === playerId);
    if (!player) return;
    this.game.discardCards(player, discards);
    this.broadcastState();
  }

  handleCallTrump(playerId: number, trump: string) {
    if (!this.game) return;
    if (this.game.bidding.highestBidder?.id !== playerId) return;
    this.game.callTrump(trump);
    this.broadcastState();
  }

  handlePlayCard(playerId: number, card: Card) {
    if (!this.game) return;
    const player = this.game.players.find((p) => p.id === playerId);
    if (!player) return;
    const success = this.game.playCard(player, card);
    if (success) this.broadcastState();
  }

  handleNextRound(playerId: number) {
    if (!this.game) return;
    if (this.game.phase !== "roundOver") return;
    this.game.startRound();
    this.broadcastState();
  }

  private broadcastLobby() {
    for (const [, socket] of this.sockets) {
      socket.emit("lobbyState", { roomId: this.id, players: this.players });
    }
  }

  private broadcastState() {
    if (!this.game) return;
    for (const [playerId, socket] of this.sockets) {
      socket.emit("gameState", this.serializeFor(playerId));
    }
  }

  private serializeFor(viewerId: number) {
    const game = this.game!;
    const viewerPlayer = game.players.find((p) => p.id === viewerId);
    const isBidder = game.bidding.highestBidder?.id === viewerId;
    const discardCount =
      game.phase === "widow" && isBidder && viewerPlayer
        ? viewerPlayer.hand.length - game.normalHandSize
        : 0;

    return {
      phase: game.phase,
      teams: game.teams.map((t) => ({
        id: t.id,
        name: t.name,
        score: t.score,
        roundScore: t.roundScore,
      })),
      players: game.players.map((p) => ({
        id: p.id,
        name: p.name,
        teamId: p.teamId,
        handCount: p.hand.length,
        hand: p.id === viewerId ? p.hand : undefined,
      })),
      trump: game.trump,
      trick: game.trick.plays,
      leadColor: game.trick.leadColor,
      widowCount: game.widow.length,
      discardCount,
      bidding: {
        currentBid: game.bidding.currentBid,
        minimumBid: game.bidding.minimumBid,
        activePlayerId: game.bidding.activePlayer.id,
        isComplete: game.bidding.isComplete,
        highestBidderId: game.bidding.highestBidder?.id ?? null,
      },
      currentPlayerId: game.currentPlayer?.id,
      roundResult: game.phase === "roundOver" ? game.lastRoundResult : null,
    };
  }
}