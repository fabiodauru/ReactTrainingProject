export default function ListWidget({
  content,
  title,
  amount = 3,
}: {
  content: string[];
  title: string;
  amount?: number;
}) {
  const visibleItems = content.slice(0, amount);
  const hasMore = content.length > amount;

  return (
    <div className="flex h-full flex-col text-white">
      <div className="mb-4 border-b border-white/10 pb-2">
        <h2 className="text-lg md:text-xl font-semibold text-white/90">
          {title}
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <ul className="space-y-2 text-[0.95rem] leading-relaxed">
          {visibleItems.map((item, index) => (
            <li
              key={index}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {hasMore && (
        <div className="mt-3 text-xs text-white/60">
          +{content.length - amount} more
        </div>
      )}
    </div>
  );
}
