import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ChevronRight, TrendingUp } from "lucide-react";
import { Button, Card, CardContent, Input } from "@kilden/designsystem";
import { createLeaderboard } from "./api.js";
import { loadRecents } from "./recents.js";
import { cx } from "./utils/cx.js";

const SCORING_MODES = [
  {
    value: "WIN_COUNT",
    label: "Win count",
    description: "Track how many times each person won",
    icon: Trophy,
  },
  {
    value: "ELO",
    label: "Elo rating",
    description: "Rating rises and falls based on who you beat",
    icon: TrendingUp,
  },
];

function OptionCard({ selected, onSelect, icon: Icon, label, description }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "flex flex-1 items-start gap-3 border p-3.5 text-left transition-colors",
        selected
          ? "border-neutral-border-strong"
          : "border-neutral-border-subtle bg-neutral-surface-default hover:border-neutral-border-default",
      )}
    >
      <div
        className={cx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          selected
            ? "bg-neutral-base-default text-neutral-base-contrast-default"
            : "bg-neutral-surface-tinted text-neutral-text-subtle",
        )}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutral-text-default">{label}</p>
        {description && <p className="mt-0.5 text-xs text-neutral-text-subtle">{description}</p>}
      </div>
    </button>
  );
}

export default function Home() {
  const [name, setName] = useState("");
  const [scoringMode, setScoringMode] = useState("WIN_COUNT");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recents, setRecents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || !password) return;

    setSubmitting(true);
    setError(null);
    try {
      const leaderboard = await createLeaderboard(name.trim(), scoringMode, password);
      navigate(`/l/${leaderboard.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center text-neutral-text-default">
            <Trophy size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-text-default sm:text-3xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-neutral-text-subtle">
            Create a leaderboard, share the link, track who's winning.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="leaderboard-name"
                label="Leaderboard name"
                type="text"
                placeholder="Leaderboard name, e.g. Friday Darts"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={error ?? undefined}
                required
                autoFocus
              />

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">Scoring</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {SCORING_MODES.map((mode) => (
                    <OptionCard
                      key={mode.value}
                      selected={scoringMode === mode.value}
                      onSelect={() => setScoringMode(mode.value)}
                      icon={mode.icon}
                      label={mode.label}
                      description={mode.description}
                    />
                  ))}
                </div>
              </div>

              <Input
                id="admin-password"
                label="Admin password"
                type="password"
                placeholder="Choose a password to delete this leaderboard later"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" size="md" isLoading={submitting} disabled={!name.trim() || !password}>
                Create leaderboard
              </Button>
            </form>
          </CardContent>
        </Card>

        {recents.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-neutral-text-subtle uppercase">
              Your recent leaderboards
            </h2>
            <div className="flex flex-col gap-2">
              {recents.map((r) => (
                <a
                  key={r.id}
                  href={`#/l/${r.id}`}
                  className="group flex items-center gap-3 border border-neutral-border-subtle bg-neutral-surface-default px-4 py-3 transition-colors hover:border-neutral-border-strong hover:bg-neutral-surface-tinted"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-surface-tinted text-neutral-text-subtle">
                    <Trophy size={16} />
                  </div>
                  <span className="flex-1 truncate text-sm font-medium text-neutral-text-default">
                    {r.name}
                  </span>
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-neutral-text-subtle group-hover:text-neutral-text-default"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
