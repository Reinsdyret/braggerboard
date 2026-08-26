import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy01, ChevronRight, AlertCircle } from "@untitledui/icons";
import { createLeaderboard } from "./api.js";
import { loadRecents } from "./recents.js";
import Button from "./components/ui/Button.jsx";
import Card from "./components/ui/Card.jsx";
import Input from "./components/ui/Input.jsx";

export default function Home() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recents, setRecents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const leaderboard = await createLeaderboard(name.trim());
      navigate(`/l/${leaderboard.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl">
        <div className="aspect-square w-[36rem] rounded-full bg-gradient-to-tr from-brand-200 to-brand-400 opacity-40" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/25">
            <Trophy01 size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Leaderboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create a leaderboard, share the link, track who's winning.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor="leaderboard-name" className="sr-only">
              Leaderboard name
            </label>
            <Input
              id="leaderboard-name"
              type="text"
              placeholder="Leaderboard name, e.g. Friday Darts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(error)}
              required
              autoFocus
            />
            <Button type="submit" size="lg" isLoading={submitting} isDisabled={!name.trim()}>
              Create leaderboard
            </Button>
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </p>
            )}
          </form>
        </Card>

        {recents.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Your recent leaderboards
            </h2>
            <div className="flex flex-col gap-2">
              {recents.map((r) => (
                <a
                  key={r.id}
                  href={`#/l/${r.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[var(--shadow-card)] transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 group-hover:bg-brand-100 group-hover:text-brand-600">
                    <Trophy01 size={16} />
                  </div>
                  <span className="flex-1 truncate text-sm font-medium text-gray-800">{r.name}</span>
                  <ChevronRight size={16} className="shrink-0 text-gray-300 group-hover:text-brand-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
