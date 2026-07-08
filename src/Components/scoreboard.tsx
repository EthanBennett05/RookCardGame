export function Scoreboard({
  teams,
}: {
  teams: { id: number; name: string; score: number; roundScore: number }[];
}) {
  return (
    <div className="flex gap-4">
      {teams.map((team) => (
        <div key={team.id} className="px-4 py-2 bg-slate-700 rounded text-center">
          <p className="text-sm text-slate-400">{team.name}</p>
          <p className="text-xl font-bold">{team.score}</p>
          <p className="text-xs text-slate-500">+{team.roundScore} this round</p>
        </div>
      ))}
    </div>
  );
}