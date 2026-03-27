type Card = { id: string; title: string };
export default function CardItem({ card }: { card: Card }) {
  return (
    <div className="border p-1 rounded bg-gray-100 mb-1">{card.title}</div>
  );
}
