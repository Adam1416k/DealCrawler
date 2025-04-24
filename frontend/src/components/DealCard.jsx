export default function DealCard({ deal }) {
  return (
    <a href={deal.link} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4">
      <img src={deal.image} alt={deal.name} className="w-full h-40 object-cover rounded" />
      <h2 className="mt-2 font-semibold text-lg">{deal.name}</h2>
      <p className="text-sm text-gray-600">{deal.deal_type}</p>
      <div className="mt-1 flex items-center justify-between text-sm text-gray-500">
        <span>{deal.service}</span>
        <span>{deal.rating} ⭐ ({deal.rating_count})</span>
      </div>
    </a>
  );
}