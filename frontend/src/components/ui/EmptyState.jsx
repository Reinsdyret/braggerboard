export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-neutral-border-default px-6 py-10 text-center">
      {Icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-surface-tinted text-neutral-text-subtle">
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-neutral-text-default">{title}</p>
        {description && <p className="mt-1 text-sm text-neutral-text-subtle">{description}</p>}
      </div>
    </div>
  );
}
