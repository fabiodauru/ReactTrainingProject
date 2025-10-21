type ListItem = {
  id: string | number;
  content: string;
};

export default function ListWidget({
  items,
  title,
  amount = 3,
  onItemClick,
}: {
  items: ListItem[];
  title: string;
  amount?: number;
  onItemClick: (id: string | number) => void;
}) {
  const list: ListItem[] = Array.isArray(items) ? items : [];
  const visibleItems = list.slice(0, amount);
  const hasMore = list.length > amount;

  return (
    <div className="flex h-full flex-col text-[var(--color-foreground)]">
      <div className="mb-4 border-b border-[var(--color-muted-foreground)] pb-2">
        <h2 className="text-lg md:text-xl font-semibold text-[var(--color-foreground)]/90">
          {title}
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <ul className="space-y-2 text-[0.95rem] leading-relaxed">
          {visibleItems.map((item) => (
            <li
                            key={item.id}
              className="px-3 py-2 rounded-xl bg-[var(--color-muted)] hover:bg-[var(--color-muted-foreground)] transition-colors duration-200"
              onClick={() => onItemClick(item.id)}
            >
              {item.content}
            </li>
          ))}
        </ul>
      </div>

      {hasMore && (
        <div className="mt-3 text-xs text-[var(--color-muted-foreground)]">
          +{list.length - amount} more
        </div>
      )}
    </div>
  );
}
