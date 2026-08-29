function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function describeChange(change) {
  if (change.field === "NAME") {
    return `Name changed from "${change.oldValue}" to "${change.newValue}"`;
  }
  return change.newValue === "photo" ? "Photo added" : "Photo removed";
}

export default function ChangeLog({ changes }) {
  if (changes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        Profile history
      </p>
      <ul className="flex flex-col gap-1.5">
        {changes.map((change) => (
          <li
            key={change.id}
            className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400"
          >
            <span className="truncate">{describeChange(change)}</span>
            <span className="shrink-0">{formatDate(change.changedAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
