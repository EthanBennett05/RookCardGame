export type SerializedCard = {
  color: string;
  number: string;
  value: number;
  points: number;
};

export type SerializedPlay = {
  card: SerializedCard;
  player: { id: number; name: string; teamId: number };
};

export type SerializedPlayer = {
  id: number;
  name: string;
  teamId: number;
  handCount: number;
  hand?: SerializedCard[]; // only present for the viewing player
};

export type SerializedTeam = {
  id: number;
  name: string;
  score: number;
  roundScore: number;
};

export type SerializedBidding = {
  currentBid: number | null;
  minimumBid: number;
  activePlayerId: number;
  isComplete: boolean;
  highestBidderId: number | null;
};

export type GameState = {
  phase: "bidding" | "widow" | "trumpSelect" | "playing" | "roundOver";
  teams: SerializedTeam[];
  players: SerializedPlayer[];
  trump: string;
  trick: SerializedPlay[];
  leadColor: string | null;
  widowCount: number;
  discardCount: number;
  bidding: SerializedBidding;
  currentPlayerId: number;
  roundResult: RoundResult | null;
};

export type LobbyPlayer = {
  id: number;
  name: string;
  team: 1 | 2 | null;
  isHost: boolean;
};

export type RoundResult = {
  biddingTeamId: number;
  bidAmount: number;
  pointsScored: number;
  madeBid: boolean;
};