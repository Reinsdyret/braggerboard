import { useEffect, useState } from "react";
import { FileTrigger, Button as AriaButton } from "react-aria-components";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from "@kilden/designsystem";
import { Camera, Trash2 } from "lucide-react";
import { updateParticipant, participantImageUrl } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function EditParticipantDialog({ participant, isOpen, onOpenChange, onUpdated }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const addToast = useToast();

  useEffect(() => {
    if (participant) {
      setName(participant.name);
      setFile(null);
      setRemoveImage(false);
      setError(null);
    }
  }, [participant]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!participant) return null;

  const showExistingImage = participant.hasImage && !removeImage && !file;

  function handleFileSelect(fileList) {
    const selected = fileList?.[0];
    if (!selected) return;
    if (selected.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`${selected.name} is ${(selected.size / (1024 * 1024)).toFixed(1)}MB, which is over the 5MB limit.`);
      return;
    }
    setError(null);
    setFile(selected);
    setRemoveImage(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Name must not be blank");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await updateParticipant(participant.id, { name: name.trim(), imageFile: file, removeImage });
      addToast("Profile updated");
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !submitting && onOpenChange(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <FileTrigger acceptedFileTypes={["image/*"]} onSelect={handleFileSelect}>
              <AriaButton
                className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-neutral-border-default bg-neutral-surface-tinted text-neutral-text-subtle outline-none transition-colors hover:border-accent-border-default hover:bg-accent-background-tinted hover:text-accent-text-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-border-default"
                aria-label="Choose a photo"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Selected preview" className="h-full w-full object-cover" />
                ) : showExistingImage ? (
                  <img
                    src={participantImageUrl(participant.id)}
                    alt={participant.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera size={20} />
                )}
              </AriaButton>
            </FileTrigger>

            {(showExistingImage || file) && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setRemoveImage(true);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-danger-text-default hover:opacity-80"
              >
                <Trash2 size={14} />
                Remove photo
              </button>
            )}
            {removeImage && (
              <button
                type="button"
                onClick={() => setRemoveImage(false)}
                className="text-sm font-medium text-neutral-text-subtle hover:text-neutral-text-default"
              >
                Undo
              </button>
            )}
          </div>

          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error ?? undefined}
            required
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} disabled={!name.trim()} className="flex-1">
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
