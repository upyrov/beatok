import type { User } from "~/api/types/user/user";

interface ParticipantsProps {
  participants: User[];
  ownerId: string;
}

export function Participants({ participants, ownerId }: ParticipantsProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Participants</h2>
      <ul className="flex flex-col gap-2">
        {participants.map((p) => (
          <li key={p.id}>
            {p.name}{" "}
            {p.id === ownerId && (
              <span className="text-gray-400 text-sm">(Owner)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
