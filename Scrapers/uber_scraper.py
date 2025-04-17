import requests
import json
import time
import urllib.parse
import re

def encode_location(area):
    """
    Build and URL-encode a JSON string representing the location data.
    This is used to update the "uev2.loc" cookie so that Uber Eats returns deals
    for the given area.
    """
    loc_data = {
        "address": {
            "address1": f"Area {area['name']}",
            "address2": "",
            "aptOrSuite": "",
            "eaterFormattedAddress": f"Area {area['name']}, Stockholm, Sweden",
            "subtitle": area["name"],
            "title": area["name"],
            "uuid": ""
        },
        "latitude": area["lat"],
        "longitude": area["lon"],
        "reference": "",
        "referenceType": "google_places",
        "type": "google_places",
        "addressComponents": {
            "city": "Stockholm",
            "countryCode": "SE",
            "firstLevelSubdivisionCode": "Stockholms län",
            "postalCode": area["name"]
        },
        "categories": ["address_point"],
        "originType": "user_autocomplete",
        "source": "rev_geo_reference",
        "userState": "Unknown"
    }
    loc_json = json.dumps(loc_data)
    return urllib.parse.quote(loc_json)

# Define the areas with postal codes and coordinates.
areas = [
    {"name": "13147", "lat": 59.314746, "lon": 18.200409},
    {"name": "13563", "lat": 59.25424,  "lon": 18.276526}
    # Extend this list as needed.
]

# Uber Eats API endpoint for deals.
url = "https://www.ubereats.com/_p/api/allStoresV1?localeCode=se-en"

# The payload used by the API.
payload = {
    "date": "",
    "startTime": 0,
    "endTime": 0,
    "sortAndFilters": [{"uuid": "33e0f7cc-8927-4dac-a92e-19a296aab097"}],
    "options": [{"uuid": "g996476c-2b1b-4db2-b40a-13d43cb117dc"}],
    "uuid": "g996476c-2b1b-4db2-b40a-13d43cb117dc",
    "surfaceName": "HOME",
    "verticalType": ""
}

# Headers to mimic a browser.
headers = {
    "accept": "*/*",
    "content-type": "application/json",
    "x-csrf-token": "x",  # Placeholder – update if needed.
    "user-agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/135.0.0.0 Safari/537.36"),
    "origin": "https://www.ubereats.com",
    "referer": "https://www.ubereats.com/se-en/feed"
    # Add other headers as needed.
}

all_deals = []  # List to hold the reformatted deals from all areas.

for area in areas:
    print(f"Scraping deals for area: {area['name']} (lat: {area['lat']}, lon: {area['lon']})")
    loc_cookie_value = encode_location(area)
    cookies = {
        "uev2.loc": loc_cookie_value
        # Include additional cookies if needed.
    }
    try:
        response = requests.post(url, headers=headers, cookies=cookies, json=payload)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Error fetching data for area {area['name']}: {e}")
        continue

    feed_items = data.get("data", {}).get("feedItems", [])
    print(f"Found {len(feed_items)} items for area {area['name']}.")

    for item in feed_items:
        # Process only regular store items
        if item.get("type") != "REGULAR_STORE":
            continue
        
        store = item.get("store", {})
        
        # Extract deal/promotion from signposts.
        signposts = store.get("signposts", [])
        deal_type = ""
        if signposts and isinstance(signposts, list):
            deal_type = signposts[0].get("text", "").strip()
        # Skip if there's no actual deal (i.e. no promotion text).
        if not deal_type:
            continue

        # Remap and extract fields according to the desired output.
        area_id = area["name"]
        name = store.get("title", {}).get("text", "")
        link = store.get("actionUrl", "")
        # Prepend domain if the link is a relative URL.
        if link and link.startswith("/"):
            link = "https://www.ubereats.com" + link
        
        image = ""
        if store.get("image", {}).get("items"):
            image = store["image"]["items"][0].get("url", "")
        
        # Look for the meta item with badgeType "ETD" to extract the estimated delivery time.
        delivery_time = ""
        meta_list = store.get("meta", [])
        for meta in meta_list:
            if meta.get("badgeType") == "ETD":
                delivery_time = meta.get("text", "")
                break
        # Skip record if no valid estimated delivery time is found.
        if not delivery_time or "kr" in delivery_time.lower():
            continue

        rating = store.get("rating", {}).get("text", "")
        rating_accessibility = store.get("rating", {}).get("accessibilityText", "")
        # Extract the review count from the accessibility text.
        rating_count = ""
        match = re.search(r'([\d,]+)\s+reviews', rating_accessibility)
        if match:
            rating_count = f"({match.group(1)})"
        
        deal_item = {
            "area_id": area_id,
            "name": name,
            "link": link,
            "image": image,
            "deal_type": deal_type,
            "rating": rating,
            "rating_count": rating_count,
            "delivery_time": delivery_time
        }
        all_deals.append(deal_item)
    
    # Sleep briefly before the next request.
    time.sleep(1)

# Save the filtered and properly mapped deals to a JSON file.
output_filename = "uber_deals.json"
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(all_deals, f, ensure_ascii=False, indent=4)

print(f"Scraping complete. Results saved to {output_filename}")
