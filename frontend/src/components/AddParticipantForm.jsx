import { useEffect, useState } from "react";
import { FileTrigger, Button as AriaButton } from "react-aria-components";
import { UserPlus, Camera, X, AlertCircle } from "lucide-react";
import { Button, Card, CardContent, Input } from "@kilden/designsystem";
import { addParticipant } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function AddParticipantForm({ leaderboardId, onAdded }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const addToast = useToast();

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileSelect(fileList) {
    const selected = fileList?.[0];
    if (!selected) return;

    if (selected.size > MAX_IMAGE_SIZE_BYTES) {
      setError(
        `${selected.name} is ${(selected.size / (1024 * 1024)).toFixed(1)}MB, which is over the 5MB limit.`,
      );
      return;
    }
    setError(null);
    setFile(selected);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await addParticipant(leaderboardId, name.trim(), file);
      addToast(`${name.trim()} joined the leaderboard`);
      setName("");
      setFile(null);
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-neutral-text-default" />
          <h3 className="text-sm font-semibold text-neutral-text-default">Add participant</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <FileTrigger acceptedFileTypes={["image/*"]} onSelect={handleFileSelect}>
            <AriaButton
              className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-neutral-border-default bg-neutral-surface-tinted text-neutral-text-subtle outline-none transition-colors hover:border-accent-border-default hover:bg-accent-background-tinted hover:text-accent-text-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-border-default"
              aria-label="Choose a photo"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Selected preview" className="h-full w-full object-cover" />
              ) : (
                <Camera size={20} />
              )}
            </AriaButton>
          </FileTrigger>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1"
              />
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-border-default text-neutral-text-subtle hover:bg-neutral-surface-tinted hover:text-neutral-text-default"
                  aria-label="Remove selected photo"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button type="submit" isLoading={submitting} disabled={!name.trim()} className="w-full sm:w-auto sm:self-end">
              Add
            </Button>
          </div>
        </form>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-danger-text-default">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
