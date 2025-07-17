import React, { useState, useEffect } from 'react';
import DealCard from './components/DealCard';

// ─── Translations ─────────────────────────────────
const translations = {
  en: {
    menu: {
      languageLabel: 'Language',
      contact: 'Contact Us',
      about: 'About'
    },
    emptyDeals: 'No deals found.'
  },
  sv: {
    menu: {
      languageLabel: 'Språk',
      contact: 'Kontakta oss',
      about: 'Om'
    },
    emptyDeals: 'Inga erbjudanden.'
  }
};

export default function App() {
  const [deals, setDeals] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('sv');

  const t = translations[language];

  useEffect(() => {
    fetch('/all_deals.json')
      .then(res => res.json())
      .then(raw => setDeals(raw));
  }, []);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-left" />
        <div className="header-center">
          <h1 className="site-title">{t.siteTitle}</h1>
        </div>
        <div className="header-right">
          <button
            className="hamburger-menu"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* SIDE MENU */}
      {menuOpen && (
        <>
          <div className="side-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <nav className="side-menu open">
            <button className="side-menu-close" onClick={() => setMenuOpen(false)}>×</button>
            <ul className="side-menu-list">
              <li className="side-menu-language">
                <label htmlFor="language-select">{t.menu.languageLabel}</label>
                <select
                  id="language-select"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="sv">Svenska</option>
                </select>
              </li>
              <li><a href="mailto:support@dealcrawler.com">{t.menu.contact}</a></li>
              <li><a href="/about">{t.menu.about}</a></li>
            </ul>
          </nav>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="app-main">
        {/* DEAL GRID */}
        {deals.length === 0 ? (
          <div className="empty-state">{t.emptyDeals}</div>
        ) : (
          <div className="deal-grid">
            {deals.map(deal => (
              <DealCard key={deal.link} deal={deal} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
