type Workspace = { id: string; name: string };
export default function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="font-bold">{workspace.name}</h2>
    </div>
  );
}
