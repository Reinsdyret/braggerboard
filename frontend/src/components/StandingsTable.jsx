import Avatar from "./Avatar.jsx";

export default function StandingsTable({ participants, onDelete }) {
  if (participants.length === 0) {
    return <p className="empty-state">No participants yet. Add someone below to get started.</p>;
  }

  return (
    <table className="standings">
      <thead>
        <tr>
          <th>#</th>
          <th></th>
          <th>Name</th>
          <th>Wins</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {participants.map((participant, index) => (
          <tr key={participant.id}>
            <td className="rank">{index + 1}</td>
            <td>
              <Avatar participant={participant} />
            </td>
            <td>{participant.name}</td>
            <td className="wins">{participant.totalWins}</td>
            <td>
              <button
                className="link-button"
                onClick={() => onDelete(participant)}
                aria-label={`Remove ${participant.name}`}
              >
                remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
