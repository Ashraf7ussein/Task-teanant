type Workspace = { id: string; name: string };
export default function WorkspaceCard({
  workspace,
  isActive,
  detail,
  onClick,
}: {
  workspace: Workspace;
  isActive?: boolean;
  detail?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
        isActive
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
      }`}
    >
      <p className="text-sm font-semibold">{workspace.name}</p>
      <p
        className={`mt-1 text-xs ${
          isActive ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {detail ?? "Workspace"}
      </p>
    </button>
  );
}
