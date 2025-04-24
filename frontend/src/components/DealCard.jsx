// src/components/DealCard.jsx

export default function DealCard({ deal }) {
  return (
    <a
      href={deal.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow hover:shadow-lg transition p-4 no-underline text-black hover:text-black focus:text-black active:text-black visited:text-black"
    >
      <img
        src={deal.image}
        alt={deal.name}
        className="w-full h-40 object-cover rounded"
      />
      <h2 className="mt-2 font-semibold text-lg text-black">
        {deal.name}
      </h2>
      <p className="text-sm text-black">
        {deal.deal_type}
      </p>
      <div className="mt-1 flex items-center justify-between text-sm text-black">
        <span>{deal.service}</span>
        <span>
          {deal.rating} ⭐ ({deal.rating_count})
        </span>
      </div>
    </a>
  );
}
