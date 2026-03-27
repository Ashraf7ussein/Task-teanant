type List = { id: string; name: string };
export default function ListCard({
  list,
  count,
  children,
}: {
  list: List;
  count?: number;
  children?: React.ReactNode;
}) {
  return (
    <section className="min-w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{list.name}</h3>
          <p className="text-xs text-slate-500">{count ?? 0} cards</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
