type Board = { id: string; name: string };
export default function BoardCard({ board }: { board: Board }) {
  return <div className="border p-3 rounded bg-gray-50 mb-2">{board.name}</div>;
}
