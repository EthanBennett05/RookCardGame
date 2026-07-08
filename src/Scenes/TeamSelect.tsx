import type { LobbyPlayer } from "../../types";


export function TeamSelect({
  roomId,
  playerId,
  players,
  onJoinTeam,
  onStart,
}: {
  roomId: string;
  playerId: number;
  players: LobbyPlayer[];
  onJoinTeam: (team: 1 | 2) => void;
  onStart: () => void;
}) {


  const team1 = players.filter(
    p => p.team === 1
  );

  const team2 = players.filter(
    p => p.team === 2
  );

  const me = players.find(
    p => p.id === playerId
  );


  return (
    <div className="bg-slate-800 p-8 rounded-xl w-[42rem]">

      <h1 className="text-xl font-bold mb-6">
        Room {roomId}
      </h1>


      <div className="grid grid-cols-2 gap-6">

        <Team
          name="Team 1"
          players={team1}
          onJoin={() => onJoinTeam(1)}
        />

        <Team
          name="Team 2"
          players={team2}
          onJoin={() => onJoinTeam(2)}
        />

      </div>


      {me?.isHost && (
        <button
          onClick={onStart}
          className="mt-6 w-full py-3 bg-yellow-400 rounded font-bold text-black"
        >
          Start Game
        </button>
      )}

    </div>
  );
}


function Team({
  name,
  players,
  onJoin,
}: {
  name: string;
  players: LobbyPlayer[];
  onJoin: () => void;
}) {

  return (
    <div>

      <h2 className="font-semibold mb-2">
        {name}
      </h2>

      <div className="bg-slate-700 p-3 rounded min-h-32">

        {players.map(player => (
          <div key={player.id}>
            {player.isHost && "👑 "}
            {player.name}
          </div>
        ))}

      </div>

      <button
        onClick={onJoin}
        className="mt-3 w-full py-2 bg-emerald-500 rounded"
      >
        Join {name}
      </button>

    </div>
  );
}