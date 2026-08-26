export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center">
      {Icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
}
