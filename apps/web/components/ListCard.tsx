type List = { id: string; name: string };
export default function ListCard({ list }: { list: List }) {
  return <div className="border p-2 rounded bg-white mb-2">{list.name}</div>;
}
