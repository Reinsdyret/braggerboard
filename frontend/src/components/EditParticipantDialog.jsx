import { useEffect, useState } from "react";
import { ModalOverlay, Modal, Dialog, Heading, FileTrigger, Button as AriaButton } from "react-aria-components";
import { X, Camera, Trash2, AlertCircle } from "lucide-react";
import { updateParticipant, participantImageUrl } from "../api.js";
import { useToast } from "./ui/ToastProvider.jsx";
import Button from "./ui/Button.jsx";
import Input from "./ui/Input.jsx";

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
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!submitting}
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-[#dedede]/50 backdrop-blur-[2px] sm:items-center sm:p-4"
    >
      <Modal className="animate-modal-in relative w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-[var(--shadow-popover)] outline-none sm:rounded-2xl">
        <Dialog className="outline-none">
          {({ close }) => (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Heading slot="title" className="text-base font-semibold text-gray-900">
                  Edit profile
                </Heading>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <FileTrigger acceptedFileTypes={["image/*"]} onSelect={handleFileSelect}>
                  <AriaButton
                    className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-100 text-gray-400 outline-none transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
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
                    className="flex items-center gap-1.5 text-sm font-medium text-[#9c0f0f] hover:text-[#7c0c0c]"
                  >
                    <Trash2 size={14} />
                    Remove photo
                  </button>
                )}
                {removeImage && (
                  <button
                    type="button"
                    onClick={() => setRemoveImage(false)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-700"
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
                required
              />

              <div className="flex gap-2">
                <Button type="button" variant="secondary" onPress={close} isDisabled={submitting} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={submitting} isDisabled={!name.trim()} className="flex-1">
                  Save changes
                </Button>
              </div>

              {error && (
                <p className="flex items-center gap-1.5 text-sm text-[#9c0f0f]">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </p>
              )}
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
