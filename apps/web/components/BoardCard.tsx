type Board = { id: string; name: string };
export default function BoardCard({
  board,
  isActive,
  detail,
  onClick,
}: {
  board: Board;
  isActive?: boolean;
  detail?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left transition p-lg ${
        isActive
          ? "border-blue-600 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <p className="font-medium text-slate-900">{board.name}</p>
      <p className="mt-1 text-xs text-slate-500">{detail ?? "Board"}</p>
    </button>
  );
}
