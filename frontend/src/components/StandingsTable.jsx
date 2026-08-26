import { useState } from "react";
import { Trash02, Users01 } from "@untitledui/icons";
import Avatar from "./Avatar.jsx";
import Badge from "./ui/Badge.jsx";
import ConfirmDialog from "./ui/ConfirmDialog.jsx";
import EmptyState from "./ui/EmptyState.jsx";

const RANK_COLOR = { 1: "gold", 2: "silver", 3: "bronze" };

function RankBadge({ rank }) {
  const color = RANK_COLOR[rank];
  if (color) {
    return <Badge color={color}>{rank}</Badge>;
  }
  return <span className="w-6 text-center text-sm font-semibold text-gray-400">{rank}</span>;
}

export default function StandingsTable({ participants, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);

  if (participants.length === 0) {
    return (
      <EmptyState
        icon={Users01}
        title="No participants yet"
        description="Add someone below to get started."
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-card)]">
        {participants.map((p, index) => {
          const rank = index + 1;
          return (
            <li
              key={p.id}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:px-5 sm:py-3.5"
            >
              <RankBadge rank={rank} />
              <div className="flex min-w-0 items-center gap-3">
                <Avatar participant={p} rankColor={RANK_COLOR[rank]} />
                <span className="truncate text-sm font-medium text-gray-900">{p.name}</span>
              </div>
              <span className="text-sm font-bold text-brand-600">{p.totalWins}</span>
              <button
                onClick={() => setPendingDelete(p)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-100"
                aria-label={`Remove ${p.name}`}
              >
                <Trash02 size={16} />
              </button>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Remove ${pendingDelete?.name}?`}
        description="This also deletes their round history. This can't be undone."
        confirmLabel="Remove"
        danger
        onConfirm={() => onDelete(pendingDelete)}
      />
    </>
  );
}
