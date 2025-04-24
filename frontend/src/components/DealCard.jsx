// src/components/DealCard.jsx

import React from 'react';

export default function DealCard({ deal }) {
  return (
    <a
      href={deal.link}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block bg-white rounded-lg shadow 
        hover:shadow-lg transition
        p-2 md:p-4 no-underline
      "
    >
      {/* exact 128px tall container */}
      <div className="w-full h-[128px] overflow-hidden rounded-lg">
        <img
          src={deal.image}
          alt={deal.name}
          className="w-full h-full object-cover object-center"
        />
      </div>

      <h2 className="mt-2 font-semibold text-xs md:text-base text-black">
        {deal.name}
      </h2>
      <p className="mt-1 text-[10px] md:text-sm text-black">
        {deal.deal_type}
      </p>
      <div className="mt-2 flex items-center justify-between text-[10px] md:text-sm text-black">
        <span className="capitalize">{deal.service.replace('_', ' ')}</span>
        <span>{deal.rating} ⭐</span>
      </div>
    </a>
  );
}
