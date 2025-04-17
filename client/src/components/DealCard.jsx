// client/src/components/DealCard.jsx
export default function DealCard({ deal }) {
    return (
      <a
        href={deal.link}
        target="_blank"
        rel="noopener"
        className="block bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition p-4"
      >
        <img
          src={deal.image}
          alt={deal.name}
          className="w-full h-32 object-cover mb-2 rounded"
          loading="lazy"
        />
        <h2 className="text-lg font-semibold mb-1">{deal.name}</h2>
        <p className="text-sm text-gray-600 mb-1">{deal.deal_type}</p>
        <div className="flex items-center text-sm text-gray-500">
          <span>⭐ {deal.rating}</span>
          <span className="ml-2">{deal.rating_count}</span>
          {deal.delivery_time && <span className="ml-auto">{deal.delivery_time}</span>}
        </div>
      </a>
    )
  }
  