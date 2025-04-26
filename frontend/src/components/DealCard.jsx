// src/components/DealCard.jsx

import React, { useRef, useState, useEffect } from 'react';

export default function DealCard({ deal }) {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  // intersection observer to trigger fade-in
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // map service key → display name
  const serviceNames = {
    foodora:   'Foodora',
    wolt:      'Wolt',
    uber_eats: 'Uber Eats',
  };
  const vendorDisplay = serviceNames[deal.service] || deal.service;
  const ratingText = deal.rating ? deal.rating : '-';
  const timeMatch = deal.delivery_time && deal.delivery_time.match(/\d+/);
  const timeDisplay = timeMatch ? `${timeMatch[0]} min` : '-';

  return (
    <a
      ref={ref}
      href={deal.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`deal-card fade-in ${isVisible ? 'visible' : ''}`}
    >
      <div className="relative">
        <img src={deal.image} alt={deal.name} className="card-image" />
        <div className="badge-group">
          <span className="deal-badge">{deal.deal_type}</span>
          <span className="vendor-badge">{vendorDisplay}</span>
        </div>
      </div>

      <div className="card-content">
        <h2 className="card-title">{deal.name}</h2>
      </div>

      <div className="bottom-badges">
        <span className="time-badge">{timeDisplay} 🚗</span>
        <span className="rating-badge">{ratingText} ⭐</span>
      </div>
    </a>
  );
}
