// src/components/DealCard.jsx

import React from 'react';

export default function DealCard({ deal }) {
  // map internal service keys to display names
  const serviceNames = {
    foodora:   'Foodora',
    wolt:      'Wolt',
    uber_eats: 'Uber Eats',
  };
  const vendorDisplay = serviceNames[deal.service] || deal.service;

  // prepare rating text (fallback to dash)
  const ratingText = deal.rating ? deal.rating : '-';

  // extract delivery time number and append “min” (or dash)
  const timeMatch = deal.delivery_time && deal.delivery_time.match(/\d+/);
  const timeDisplay = timeMatch ? `${timeMatch[0]} min` : '-';

  return (
    <a
      href={deal.link}
      target="_blank"
      rel="noopener noreferrer"
      className="deal-card"
    >
      {/* IMAGE + TOP BADGES */}
      <div className="relative">
        <img
          src={deal.image}
          alt={deal.name}
          className="card-image"
        />

        <div className="badge-group">
          <span className="deal-badge">{deal.deal_type}</span>
          <span className="vendor-badge">{vendorDisplay}</span>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="card-content">
        <h2 className="card-title">{deal.name}</h2>
      </div>

      {/* BOTTOM-RIGHT BADGES */}
      <div className="bottom-badges">
        <span className="time-badge">{timeDisplay} 🚗</span>
        <span className="rating-badge">{ratingText} ⭐</span>
      </div>
    </a>
  );
}
