import requests
import json
import time

# Foodora GraphQL API endpoint
url = "https://op.fd-api.com/rlp-service/query"

# Headers that mimic a browser request – update session-specific headers as needed.
headers = {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json;charset=UTF-8",
    "origin": "https://www.foodora.se",
    "app-version": "VENDOR-LIST-MICROFRONTEND.25.16.0001",
    "perseus-client-id": "1744813142542.239060138092136926.b1trl6cncg",
    "perseus-session-id": "1744813142542.716272132247331471.g6whas42lc",
    "platform": "web",
    "user-agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/135.0.0.0 Safari/537.36"
    ),
    "x-fp-api-key": "volo"
}

# Define the areas you want to scrape (example areas in Stockholm)
areas = [
    {"name": "13145", "lat": 59.315202, "lon": 18.200045},
    {"name": "13563", "lat": 59.25424,  "lon": 18.276526}
]

all_deals = []  # This list will hold our scraped deals

# Define the GraphQL query.
graphql_query = """
query getOrganicListing(
  $includeCarousels: Boolean!,
  $includeDynamicSearchbarConfig: Boolean!,
  $includeJoker: Boolean!,
  $includeSwimlanes: Boolean!,
  $input: OrganicListingInput!,
  $customer_id: String!,
  $customer_type: String!,
  $expedition_type: String!,
  $feature_flags: [FeatureFlagInput!]!,
  $joker_offers: JokerOffersInput!,
  $language_id: String!,
  $latitude: Float!,
  $locale: String!,
  $longitude: Float!,
  $organic_listing: OrganicListingSettingsInput!,
  $subscription: SubscriptionInput!,
  $swimlanes: SwimlanesInput!
) {
  rlp {
    organic_listing(
      input: $input,
      customer_id: $customer_id,
      customer_type: $customer_type,
      expedition_type: $expedition_type,
      feature_flags: $feature_flags,
      joker_offers: $joker_offers,
      language_id: $language_id,
      latitude: $latitude,
      locale: $locale,
      longitude: $longitude,
      organic_listing: $organic_listing,
      subscription: $subscription,
      swimlanes: $swimlanes
    ) {
      items {
        id
        code
        budget
        name
        tag
        rating
        review_number
        latitude
        longitude
        minimum_order_amount
        delivery_duration_range {
          lower_limit_in_minutes
          upper_limit_in_minutes
        }
        hero_listing_image
        url_key
      }
      views {
        budgets
        configuration
        cuisines
        discounts
        food_characteristics
        delivery_providers
        limit
        ncr_place
        ncr_screen
        offset
        payment_types
        quick_filters
        tag_label_metadata
        use_free_delivery_label
      }
    }
  }
}
"""

# For each area, build the variables payload and send the POST request.
for area in areas:
    print(f"Scraping deals for area {area['name']} (lat: {area['lat']}, lon: {area['lon']})")
    
    variables = {
        "includeCarousels": False,
        "includeDynamicSearchbarConfig": False,
        "includeJoker": False,
        "includeSwimlanes": False,
        "input": {
            "latitude": area["lat"],
            "longitude": area["lon"],
            "locale": "sv_SE",
            "language_id": "4"
            # Add other keys if necessary
        },
        "customer_id": "",
        "customer_type": "REGULAR",
        "expedition_type": "DELIVERY",
        "feature_flags": [
            {"name": "dynamic-pricing-indicator", "value": "Variant"},
            {"name": "saver-delivery-upper-funnel", "value": "Control"},
            {"name": "pd-mp-homescreen-full-federation", "value": "Control"}
        ],
        "joker_offers": {"single_discount": False},
        "language_id": "4",
        "latitude": area["lat"],
        "locale": "sv_SE",
        "longitude": area["lon"],
        "organic_listing": {
            "views": [{
                "budgets": "",
                "configuration": "Original",
                "cuisines": "",
                "discounts": "",
                "food_characteristics": "",
                "delivery_providers": "",
                "limit": 50,
                "ncr_place": "list",
                "ncr_screen": "shop_list",
                "offset": 0,
                "payment_types": "",
                "quick_filters": "has_discount",
                "tag_label_metadata": False,
                "use_free_delivery_label": True
            }]
        },
        "subscription": {"status": "NON_ELIGIBLE", "has_benefits": False},
        "swimlanes": {"config": "Original"}
    }
    
    payload = {
        "query": graphql_query,
        "variables": variables
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Error fetching data for area {area['name']}: {e}")
        if 'response' in locals() and response is not None:
            print("Response content:", response.text)
        continue

    # Extract deal items from the response. Note: they are nested under data → rlp → organic_listing.
    items = data.get("data", {}).get("rlp", {}).get("organic_listing", {}).get("items", [])
    print(f"Found {len(items)} deals for area {area['name']}.")
    
    for item in items:
        deal_item = {
            "area_id": area["name"],
            "id": item.get("id"),
            "code": item.get("code"),
            "budget": item.get("budget"),
            "name": item.get("name"),
            "tag": item.get("tag"),
            "rating": item.get("rating"),
            "review_number": item.get("review_number"),
            "latitude": item.get("latitude"),
            "longitude": item.get("longitude"),
            "minimum_order_amount": item.get("minimum_order_amount"),
            "delivery_time_lower": item.get("delivery_duration_range", {}).get("lower_limit_in_minutes"),
            "delivery_time_upper": item.get("delivery_duration_range", {}).get("upper_limit_in_minutes"),
            "hero_listing_image": item.get("hero_listing_image"),
            "url_key": item.get("url_key")
        }
        all_deals.append(deal_item)
    
    time.sleep(1)  # Pause between requests

# Save all collected deals to a JSON file.
output_filename = "foodora_deals.json"
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(all_deals, f, ensure_ascii=False, indent=4)

print(f"Scraping complete. Results saved to {output_filename}")
