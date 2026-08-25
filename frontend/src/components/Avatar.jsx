import { participantImageUrl } from "../api.js";

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Avatar({ participant, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (participant.hasImage) {
    return (
      <img
        className="avatar"
        style={style}
        src={participantImageUrl(participant.id)}
        alt={participant.name}
      />
    );
  }

  return (
    <div className="avatar avatar-placeholder" style={style}>
      {initials(participant.name)}
    </div>
  );
}
