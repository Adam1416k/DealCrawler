import React, { useState, useEffect, useMemo, useRef } from 'react';
import FilterBar from './components/FilterBar';
import DealCard from './components/DealCard';

export default function App() {
  const [deals, setDeals] = useState([]);
  const [postal, setPostal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    service: [], cuisine: [], dealCategory: [], rating: null,
  });
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('sv');
  const postalInputRef = useRef();

  useEffect(() => {
    fetch('/all_deals.json')
      .then(res => res.json())
      .then(data => setDeals(data));
  }, []);

  const translations = {
    en: {
      siteTitle:         'DealCrawler',
      postalPlaceholder: 'Postal code',
      emptyEnter:        'Enter postal code to see deals',
      enterPostalButton: 'Enter postal code',
      searchPlaceholder: 'Search restaurants…',
      showFilters:       'Show Filters',
      hideFilters:       'Hide Filters',
      sortOptions: {
        relevance: 'Relevance',
        fastest:   'Fastest Delivery',
        rating:    'Highest Rating',
      },
      menu: {
        languageLabel: 'Language',
        contact:       'Contact Us',
        about:         'About',
      },
      filterBar: {
        vendorLabel:       'Vendor:',
        cuisineLabel:      'Cuisine:',
        dealTypeLabel:     'Deal Type:',
        minRatingLabel:    'Rating:',
        anyOption:         'Any',
        dealTypeOptions: {                     // ← NEW
          'Percentage off':    'Percentage off',
          'Fixed-amount off':  'Fixed-amount off',
          'Other':              'Other',
        }
      }
    },
    sv: {
      siteTitle:         'DealCrawler',
      postalPlaceholder: 'Postnummer',
      emptyEnter:        'Ange postnummer för att se erbjudanden',
      enterPostalButton: 'Ange postnummer',
      searchPlaceholder: 'Sök restauranger…',
      showFilters:       'Visa filter',
      hideFilters:       'Dölj filter',
      sortOptions: {
        relevance: 'Relevans',
        fastest:   'Snabbast leverans',
        rating:    'Högsta betyg',
      },
      menu: {
        languageLabel: 'Språk',
        contact:       'Kontakta oss',
        about:         'Om',
      },
      filterBar: {
        vendorLabel:       'Leverantör:',
        cuisineLabel:      'Mattyp:',
        dealTypeLabel:     'Erbjudandekategori:',
        minRatingLabel:    'Betyg:',
        anyOption:         'Alla',
        dealTypeOptions: {                     // ← NEW
          'Percentage off':    'Procentrabatt',
          'Fixed-amount off':  'Fast rabatt',
          'Other':              'Övrigt',
        }
      }
    }
  };
  const t = translations[language];

  function categorizeDealType(text) {
    if (!text) return 'Other';
    const lower = text.toLowerCase();
    if (lower.includes('%'))     return 'Percentage off';
    if (lower.match(/\d+\s?kr/)) return 'Fixed-amount off';
    return 'Other';
  }
  const allBuckets = ['Percentage off','Fixed-amount off','Other'];

  const services = ['foodora','wolt','uber_eats'];
  const cuisines = useMemo(
    () => Array.from(new Set(deals.map(d => d.cuisine).filter(Boolean))),
    [deals]
  );
  const dealCategories = useMemo(() => {
    const seen = new Set(deals.map(d => categorizeDealType(d.deal_type)));
    return allBuckets.filter(cat => seen.has(cat));
  }, [deals]);

  const filtered = deals
    .filter(d => d.area_id === postal)
    .filter(d =>
      !searchTerm ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(d =>
      !filters.service.length || filters.service.includes(d.service)
    )
    .filter(d =>
      !filters.cuisine.length || filters.cuisine.includes(d.cuisine)
    )
    .filter(d =>
      !filters.dealCategory.length ||
      filters.dealCategory.includes(categorizeDealType(d.deal_type))
    )
    .filter(d => {
      if (filters.rating == null) return true;
      const r = parseFloat(d.rating);
      return !isNaN(r) && r >= filters.rating;
    });

  const parseDelivery = d => {
    const m = d.delivery_time && d.delivery_time.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : Infinity;
  };

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'fastest') {
      arr.sort((a,b) => parseDelivery(a) - parseDelivery(b));
    } else if (sortBy === 'rating') {
      arr.sort((a,b) =>
        (parseFloat(b.rating)||0) - (parseFloat(a.rating)||0)
      );
    }
    return arr;
  }, [filtered, sortBy]);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <input
            ref={postalInputRef}
            type="text"
            placeholder={t.postalPlaceholder}
            value={postal}
            onChange={e => setPostal(e.target.value)}
            className="postal-input"
          />
        </div>
        <div className="header-center">
          <h1 className="site-title">{t.siteTitle}</h1>
        </div>
        <div className="header-right">
          <button
            className="hamburger-menu"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {/* SIDE MENU */}
      {menuOpen && (
        <>
          <div
            className="side-menu-backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="side-menu open">
            <button
              className="side-menu-close"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              ×
            </button>
            <ul className="side-menu-list">
              <li className="side-menu-language">
                <label htmlFor="language-select">
                  {t.menu.languageLabel}
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="sv">Svenska</option>
                </select>
              </li>
              <li>
                <a href="mailto:support@dealcrawler.com">
                  {t.menu.contact}
                </a>
              </li>
              <li>
                <a href="/about">{t.menu.about}</a>
              </li>
            </ul>
          </nav>
        </>
      )}

      {/* MAIN */}
      <main className="app-main">
        {!postal ? (
          <div className="empty-state">
            {t.emptyEnter}
            <button
              className="enter-postal-button"
              onClick={() => postalInputRef.current?.focus()}
            >
              {t.enterPostalButton}
            </button>
          </div>
        ) : (
          <>
            <div className="search-wrapper">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="controls-row">
              <button
                onClick={() => setShowFilters(f => !f)}
                className="filter-toggle"
              >
                {showFilters ? t.hideFilters : t.showFilters}
              </button>
              <div className="sort-wrapper">
                <label className="filter-label">{t.sortByLabel}</label>
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="">
                    {t.sortOptions.relevance}
                  </option>
                  <option value="fastest">
                    {t.sortOptions.fastest}
                  </option>
                  <option value="rating">
                    {t.sortOptions.rating}
                  </option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="filter-panel mb-6">
                <FilterBar
                  services={services}
                  cuisines={cuisines}
                  dealCategories={dealCategories}
                  filters={filters}
                  setFilters={setFilters}
                  translations={t.filterBar}
                />
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="empty-state">
                No deals found for postal code <strong>{postal}</strong>.
              </div>
            ) : (
              <div className="deal-grid">
                {sorted.map(deal => (
                  <DealCard key={deal.link} deal={deal} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
