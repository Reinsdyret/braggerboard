function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RoundHistory({ rounds }) {
  if (rounds.length === 0) {
    return <p className="empty-state">No rounds recorded yet.</p>;
  }

  return (
    <ul className="round-history">
      {rounds.map((round) => (
        <li key={round.id} className="card">
          <div className="round-history-header">
            <strong>{round.label || "Round"}</strong>
            <span className="round-history-date">{formatDate(round.createdAt)}</span>
          </div>
          <ul className="round-history-results">
            {round.results.map((result) => (
              <li key={result.participantId}>
                {result.participantName}: {result.wins}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
