type Card = { id: string; title: string; content?: string | null };
export default function CardItem({ card }: { card: Card }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <h4 className="text-sm font-medium text-slate-900">{card.title}</h4>
      <p className="mt-1 text-xs text-slate-500">
        {card.content?.trim() || "No description yet."}
      </p>
    </article>
  );
}
