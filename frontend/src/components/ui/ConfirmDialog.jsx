import { useState } from "react";
import { ModalOverlay, Modal, Dialog, Heading } from "react-aria-components";
import Button from "./Button.jsx";

export default function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!isSubmitting}
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 backdrop-blur-[2px] sm:items-center sm:p-4"
    >
      <Modal className="animate-modal-in w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-[var(--shadow-popover)] outline-none sm:rounded-2xl dark:bg-gray-800">
        <Dialog className="outline-none">
          {({ close }) => (
            <>
              <Heading slot="title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </Heading>
              {description && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" onPress={close} isDisabled={isSubmitting}>
                  {cancelLabel}
                </Button>
                <Button
                  variant={danger ? "danger-solid" : "primary"}
                  onPress={handleConfirm}
                  isLoading={isSubmitting}
                >
                  {confirmLabel}
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
