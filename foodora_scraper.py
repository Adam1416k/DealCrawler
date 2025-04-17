#!/usr/bin/env python3
import requests
import json
import time

# ————————————— Your areas —————————————
areas = [
    {"name": "13145", "latitude": 59.315202, "longitude": 18.200045},
    {"name": "13563", "latitude": 59.25424,  "longitude": 18.276526},
    # … add the rest of your ~40 postal codes here …
]

# ————————————— GraphQL with tags —————————————
GRAPHQL = """
query fetchDeals($input: RLPInput!) {
  rlp(params: $input) {
    organic_listing {
      views {
        items {
          id
          name
          rating
          review_number
          delivery_duration_range {
            lower_limit_in_minutes
            upper_limit_in_minutes
          }
          hero_listing_image
          url_key
          tags {
            code
            text
          }
        }
      }
    }
  }
}
"""

# ————————————— Step 1: warm up session —————————————
session = requests.Session()
session.headers.update({
    "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7",
})

# fetch the public deals page to get fresh cookies
session.get("https://www.foodora.se/contents/deals", timeout=10).raise_for_status()

# ————————————— Step 2: extract & reuse cookies as headers —————————————
dps     = session.cookies.get("dps-session-id")
perseus = session.cookies.get("perseus-session-id")
cf_bm   = session.cookies.get("__cf_bm", domain="op.fd-api.com")
pxhd    = session.cookies.get("_pxhd",  domain="op.fd-api.com")

session.headers.update({
    "dps-session-id":     dps,
    "perseus-session-id": perseus,
    "app-version":        "VENDOR-LIST-MICROFRONTEND.25.16.0023",
    "x-fp-api-key":       "volo",
    "Origin":             "https://www.foodora.se",
    "Referer":            "https://www.foodora.se/"
})

# ensure the CF cookies go to the GraphQL host
if cf_bm:
    session.cookies.set("__cf_bm", cf_bm, domain="op.fd-api.com", path="/")
if pxhd:
    session.cookies.set("_pxhd", pxhd, domain="op.fd-api.com", path="/")

# ————————————— Step 3: scrape + filter + reformat —————————————
all_deals = []

for area in areas:
    print(f"🔍 Scraping {area['name']} @ ({area['latitude']}, {area['longitude']})")

    payload = {
        "query": GRAPHQL,
        "variables": {
            "input": {
                "latitude":        area["latitude"],
                "longitude":       area["longitude"],
                "locale":          "sv_SE",
                "language_id":     "4",
                "customer_id":     "",
                "customer_type":   "REGULAR",
                "expedition_type": "DELIVERY",
                "joker_offers":    {"single_discount": False},
                "feature_flags": [
                    {"name": "dynamic-pricing-indicator",   "value": "Variant"},
                    {"name": "saver-delivery-upper-funnel", "value": "Control"},
                    {"name": "pd-mp-homescreen-full-federation", "value": "Control"}
                ],
                "subscription": {"status": "NON_ELIGIBLE", "has_benefits": False},
                "organic_listing": {
                    "views": [{
                        "budgets":                 "",
                        "configuration":           "Original",
                        "cuisines":                "",
                        "discounts":               "",
                        "food_characteristics":    "",
                        "quick_filters":           "has_discount",
                        "use_free_delivery_label": True,
                        "ncr_place":               "list",
                        "ncr_screen":              "shop_list",
                        "payment_types":           "",
                        "delivery_providers":      "",
                        "discount_labels":         "",
                        "tag_label_metadata":      False,
                        "limit":                   50,
                        "offset":                  0
                    }]
                },
                "swimlanes": {"config": "Original"}
            }
        }
    }

    try:
        r = session.post(
            "https://op.fd-api.com/rlp-service/query",
            json=payload,
            timeout=10
        )
        r.raise_for_status()
    except Exception as e:
        print("  ⚠️", e)
        continue

    data = r.json()
    views = (data.get("data", {})
                 .get("rlp", {})
                 .get("organic_listing", {})
                 .get("views", []))
    if not views:
        print("No views returned")
        continue

    items = views[0].get("items", [])
    print(f"{len(items)} total vendors")

    for it in items:
        # pick only the "DEAL" tag
        deal_tags = [t for t in it.get("tags", []) if t.get("code") == "DEAL"]
        if not deal_tags:
            continue
        deal_text = deal_tags[0].get("text", "").strip()

        # safe delivery time
        dr = it.get("delivery_duration_range") or {}
        low  = dr.get("lower_limit_in_minutes")
        high = dr.get("upper_limit_in_minutes")
        delivery = f"{low}-{high} min" if low is not None and high is not None else ""

        # format rating count
        cnt = it.get("review_number") or 0
        rating_count = f"({cnt:,})" if cnt else ""

        all_deals.append({
            "area_id":      area["name"],
            "name":         it.get("name", ""),
            "link":         f"https://www.foodora.se/restaurant/{it.get('url_key','')}",
            "image":        it.get("hero_listing_image", ""),
            "deal_type":    deal_text,
            "rating":       str(it.get("rating", "")),
            "rating_count": rating_count,
            "delivery_time":delivery
        })

    # be polite
    time.sleep(1)

# ————————————— Step 4: write to JSON —————————————
with open("foodora_deals.json", "w", encoding="utf-8") as f:
    json.dump(all_deals, f, ensure_ascii=False, indent=2)

print(f"\nDone – {len(all_deals)} deals saved to foodora_deals.json")
