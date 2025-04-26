import React, { useState, useEffect, useMemo, useRef } from 'react';
import FilterBar from './components/FilterBar';
import DealCard  from './components/DealCard';

// ─── Constants ────────────────────────────────────

// 1) the cuisines we want to expose
const ALLOWED_CUISINES = [
  'Sushi',
  'Thai',
  'Pizza',
  'Burgers',
  'Indian',
  'Asian',
  'Italian',
  'Kebab'
];

// 2) collapse raw values → one of the above (including Swedish variants)
const CUISINE_SYNONYMS = {
  // Burgers
  burgers:    'Burgers',   Burgers:    'Burgers',
  Burger:     'Burgers',
  burgare:    'Burgers',   Burgare:    'Burgers',
  hamburgare: 'Burgers',   Hamburgare: 'Burgers',

  // Pizza
  pizza:      'Pizza',     Pizza:      'Pizza',
  pizzeria:   'Pizza',     Pizzeria:   'Pizza',

  // Italian
  italian:    'Italian',   Italian:    'Italian',
  italienskt: 'Italian',   Italienskt: 'Italian',
  italiensk:  'Italian',   Italiensk:  'Italian',
  pasta:      'Italian',   Pasta:      'Italian',

  // Sushi
  sushi:      'Sushi',     Sushi:      'Sushi',
  sashimi:    'Sushi',

  // Thai
  thai:       'Thai',      Thai:       'Thai',
  thailändskt:'Thai',      Thailändskt:'Thai',
  thailändsk: 'Thai',      Thailändsk: 'Thai',

  // Indian
  indian:     'Indian',    Indian:     'Indian',
  indiskt:    'Indian',    Indiskt:    'Indian',
  indisk:     'Indian',    Indisk:     'Indian',
  curry:      'Indian',    Curry:      'Indian',
  'soup-curry':'Indian',

  // Asian (catch-all)
  asian:      'Asian',     Asian:      'Asian',
  japanese:   'Asian',     Japanese:   'Asian',
  japanskt:   'Asian',     Japanskt:   'Asian',
  japansk:    'Asian',     Japansk:    'Asian',
  chinese:    'Asian',     Chinese:    'Asian',
  kinesiskt:  'Asian',     Kinesiskt:  'Asian',
  kinamat:    'Asian',
  vietnamese: 'Asian',     Vietnamese: 'Asian',
  vietnamesiskt:'Asian',   Vietnamesiskt:'Asian',
  korean:     'Asian',     Korean:     'Asian',
  koreanskt:  'Asian',     Koreanskt:  'Asian',
  ramen:      'Asian',     Ramen:      'Asian',
  bento:      'Asian',     Bento:      'Asian',
  yakiniku:   'Asian',     Yakiniku:   'Asian',
  yakitori:   'Asian',     Yakitori:   'Asian',
  'central-asian':'Asian',

  // Kebab (new)
  kebab:      'Kebab',     Kebab:      'Kebab',


  // everything else → Other
  american:    'Burgers',    American:    'Burgers',
  amerikanskt: 'Burgers',    Amerikanskt: 'Burgers',
  mexican:     'Other',    Mexican:     'Other',
  mexikanskt:  'Other',    Mexikanskt:  'Other',
  mediterranean:'Kebab',   Mediterranean:'Kebab',
  european:    'Other',    European:    'Other',
  europeiskt:  'Other',    Europeiskt:  'Other',
  vegetarian:  'Other',    Vegetarian:  'Other',
  vegan:       'Other',    Vegan:       'Other',
  'gluten-free':'Other',   glutenfree:  'Other',
  healthy:     'Other',    Healthy:     'Other',
  dessert:     'Other',    Dessert:     'Other',
  ice_cream:   'Other',    'Ice cream':'Other',
  snacks:      'Other',    Snacks:      'Other',
  salad:       'Other',    Salad:       'Other',
  sallader:    'Other',    Sallader:    'Other',
  bowl:        'Other',    Bowl:        'Other',
  bowls:       'Other',
  sandwich:    'Other',    Sandwich:    'Other',
  smörgåsar:   'Other',    Smörgåsar:   'Other',
  wraps:       'Kebab',    Wraps:       'Kebab',
  falafel:     'Kebab',    Falafel:     'Kebab',
  shawarma:    'Kebab',
  'Poke Bowl': 'Other',
  'pommes frites':'Other',
  fish:        'Other',    Fish:        'Other',
  chicken:     'Other',    Chicken:     'Other',
  steak:       'Other',    Steak:       'Other',
  wings:       'Other',    Wings:       'Other',
  drycker:     'Other',    Drycker:     'Other',
  kaffe:       'Other',    Kaffe:       'Other',
  bakery:      'Other',    Bakery:      'Other',
  taco:        'Other',    tacos:       'Other',
  Doner:       'Kebab',    doner:       'Kebab',
  nachos:      'Other',
  'kids-meals':'Other',
  brunch:      'Other',
  cafeteria:   'Other',
  Other:       'Other'
};

// ─── Translations ─────────────────────────────────
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
      dealTypeOptions: {
        'Percentage off':   'Percentage off',
        'Fixed-amount off': 'Fixed-amount off',
        'Other':             'Other',
      },
      cuisineOptions: {
        Sushi:   'Sushi',
        Thai:    'Thai',
        Pizza:   'Pizza',
        Burgers: 'Burgers',
        Indian:  'Indian',
        Asian:   'Asian',
        Italian: 'Italian',
        Kebab:   'Kebab',
        Other:   'Other',
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
      dealTypeOptions: {
        'Percentage off':   'Procentrabatt',
        'Fixed-amount off': 'Fast rabatt',
        'Other':             'Övrigt',
      },
      cuisineOptions: {
        Sushi:   'Sushi',
        Thai:    'Thai',
        Pizza:   'Pizza',
        Burgers: 'Burgare',
        Indian:  'Indisk',
        Asian:   'Asiatisk',
        Italian: 'Italiensk',
        Kebab:   'Kebab',
        Other:   'Övrigt',
      }
    }
  }
};

export default function App() {
  const [deals, setDeals] = useState([]);
  const [postal, setPostal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    service: [], cuisine: [], dealCategory: [], rating: null
  });
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('sv');
  const postalInputRef = useRef();

  const translations = {
    en: {
      siteTitle: 'DealCrawler',
      postalPlaceholder: 'Postal code',
      emptyEnter: 'Enter postal code to see deals',
      enterPostalButton: 'Enter postal code',
      searchPlaceholder: 'Search restaurants…',
      showFilters: 'Show Filters',
      hideFilters: 'Hide Filters',
      sortOptions: {
        relevance: 'Relevance',
        fastest: 'Fastest Delivery',
        rating: 'Highest Rating'
      },
      menu: {
        languageLabel: 'Language',
        contact: 'Contact Us',
        about: 'About'
      },
      filterBar: {
        vendorLabel: 'Vendor:',
        cuisineLabel: 'Cuisine:',
        dealTypeLabel: 'Deal Type:',
        minRatingLabel: 'Rating:',
        anyOption: 'Any',
        dealTypeOptions: {
          'Percentage off': 'Percentage off',
          'Fixed-amount off': 'Fixed-amount off',
          Other: 'Other'
        },
        cuisineOptions: {
          Sushi: 'Sushi',
          Thai: 'Thai',
          Pizza: 'Pizza',
          Burgers: 'Burgers',
          Indian: 'Indian',
          Asian: 'Asian',
          Italian: 'Italian',
          Kebab: 'Kebab',
          Other: 'Other'
        }
      }
    },
    sv: {
      siteTitle: 'DealCrawler',
      postalPlaceholder: 'Postnummer',
      emptyEnter: 'Ange postnummer för att se erbjudanden',
      enterPostalButton: 'Ange postnummer',
      searchPlaceholder: 'Sök restauranger…',
      showFilters: 'Visa filter',
      hideFilters: 'Dölj filter',
      sortOptions: {
        relevance: 'Relevans',
        fastest: 'Snabbast leverans',
        rating: 'Högsta betyg'
      },
      menu: {
        languageLabel: 'Språk',
        contact: 'Kontakta oss',
        about: 'Om'
      },
      filterBar: {
        vendorLabel: 'Leverantör:',
        cuisineLabel: 'Mattyp:',
        dealTypeLabel: 'Erbjudandekategori:',
        minRatingLabel: 'Betyg:',
        anyOption: 'Alla',
        dealTypeOptions: {
          'Percentage off': 'Procentrabatt',
          'Fixed-amount off': 'Fast rabatt',
          Other: 'Övrigt'
        },
        cuisineOptions: {
          Sushi: 'Sushi',
          Thai: 'Thai',
          Pizza: 'Pizza',
          Burgers: 'Burgare',
          Indian: 'Indisk',
          Asian: 'Asiatisk',
          Italian: 'Italiensk',
          Kebab: 'Kebab',
          Other: 'Övrigt'
        }
      }
    }
  };
  const t = translations[language];

  // Normalize and backfill cuisines, then set state
  useEffect(() => {
    fetch('/all_deals.json')
      .then(res => res.json())
      .then(raw => {
        const nameCuisine = {};
        raw.forEach(d => {
          if (d.cuisine) {
            const mapped = CUISINE_SYNONYMS[d.cuisine] || CUISINE_SYNONYMS.default;
            nameCuisine[d.name] = mapped;
          }
        });
        const filled = raw.map(d => {
          let cuisine = d.cuisine
            ? (CUISINE_SYNONYMS[d.cuisine] || CUISINE_SYNONYMS.default)
            : nameCuisine[d.name] || 'Other';
          if (!ALLOWED_CUISINES.includes(cuisine)) cuisine = 'Other';
          return { ...d, cuisine };
        });
        setDeals(filled);
      });
  }, []);

  // categorize deal_type into buckets
  function categorizeDealType(text) {
    if (!text) return 'Other';
    const t = text.toLowerCase();
    if (t.includes('%')) return 'Percentage off';
    if (/\d+\s?kr/.test(t)) return 'Fixed-amount off';
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

  // filtering pipeline
  const filtered = deals
    .filter(d => d.area_id === postal)
    .filter(d => !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(d => !filters.service.length || filters.service.includes(d.service))
    .filter(d => !filters.cuisine.length || filters.cuisine.includes(d.cuisine))
    .filter(d => !filters.dealCategory.length || filters.dealCategory.includes(categorizeDealType(d.deal_type)))
    .filter(d => {
      if (filters.rating == null) return true;
      const r = parseFloat(d.rating);
      return !isNaN(r) && r >= filters.rating;
    });

  // helper to parse delivery_time
  const parseDelivery = d => {
    const m = d.delivery_time && d.delivery_time.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : Infinity;
  };

  // sorting
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'fastest') {
      arr.sort((a,b) => parseDelivery(a) - parseDelivery(b));
    } else if (sortBy === 'rating') {
      arr.sort((a,b) => (parseFloat(b.rating)||0) - (parseFloat(a.rating)||0));
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
            {/* SEARCH BAR */}
            <div className="search-wrapper">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* FILTER & SORT */}
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
                  <option value="">{t.sortOptions.relevance}</option>
                  <option value="fastest">{t.sortOptions.fastest}</option>
                  <option value="rating">{t.sortOptions.rating}</option>
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
                {language === 'sv'
                  ? `Inga erbjudanden för postnummer ${postal}.`
                  : `No deals found for postal code ${postal}.`}
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