import requests
import json
import time

# --- Configuration ---

# Headers to mimic a browser request.
HEADERS = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 CrKey/1.54.250320",
    "x-csrf-token": "x"
}

# Uber Eats API endpoint.
API_URL = "https://www.ubereats.com/_p/api/getFeedV1?localeCode=se"

# List of areas in Stockholm you want to scrape.
# (For each area you need an area_id, a name, and coordinates.)
areas = [
    {"area_id": "13145", "name": "Nacka", "latitude": 59.315202, "longitude": 18.200045},
    {"area_id": "13562", "name": "Tyresö", "latitude": 59.25424, "longitude": 18.276526}
    # Add more area definitions here; you mentioned roughly 40 areas.
    # {"area_id": "...", "name": "Area Name", "latitude": <lat>, "longitude": <lon>},
]

# --- Extraction Function ---

def extract_deal_from_item(item):
    """
    Extracts deal information from a store item, which may be encountered as either:
      - A REGULAR_STORE item (with the store data in item["store"])
      - An item from a REGULAR_CAROUSEL (which is the store data itself)
    
    This function looks for:
      - The store name (from title.text)
      - A link (by prefixing the relative URL from actionUrl)
      - An image (the first item from image.items)
      - The deal type from signposts (if available either in the top-level item or nested within store)
      - Delivery time from meta where badgeType == "ETD"
      - Rating information (if available)
    """
    # If this is a REGULAR_STORE item, the actual data is nested under "store".
    if "store" in item:
        store_data = item["store"]
    else:
        store_data = item

    # Extract basic information.
    name = store_data.get("title", {}).get("text", "")
    action_url = store_data.get("actionUrl", "")
    link = f"https://www.ubereats.com{action_url}" if action_url else ""
    image = ""
    image_items = store_data.get("image", {}).get("items", [])
    if image_items:
        image = image_items[0].get("url", "")
    
    # Attempt to find deal information in "signposts".
    deal_type = ""
    # First check the top-level item.
    if "signposts" in item and item["signposts"]:
        deal_type = item["signposts"][0].get("text", "")
    # Then, check if the nested store data includes it.
    elif "signposts" in store_data and store_data["signposts"]:
        deal_type = store_data["signposts"][0].get("text", "")
    
    # Look for delivery time in the meta data (badgeType "ETD").
    delivery_time = ""
    meta_list = store_data.get("meta", [])
    for meta in meta_list:
        if meta.get("badgeType") == "ETD":
            delivery_time = meta.get("text", "")
            break

    # Get rating information if available.
    rating = ""
    rating_count = ""
    if "rating" in store_data:
        rating = store_data.get("rating", {}).get("text", "")
        rating_count = store_data.get("rating", {}).get("accessibilityText", "")
    
    return {
        "name": name,
        "link": link,
        "image": image,
        "deal_type": deal_type,
        "rating": rating,
        "rating_count": rating_count,
        "delivery_time": delivery_time
    }

# --- Scraping Function ---

def scrape_area(area):
    """
    Sends a POST request for the given area (with specified latitude, longitude, and address).
    The payload includes an explicit dining mode and a filter for deals ("dealsFilter": "DEALS").
    This function handles both REGULAR_CAROUSEL and REGULAR_STORE item types.
    """
    # Adjust the payload based on your browser’s request if needed.
    payload = {
        "request": {
            "location": {
                "latitude": area["latitude"],
                "longitude": area["longitude"],
                "address": area["name"]
            },
            "diningMode": "DELIVERY",  # Explicitly setting dining mode.
            "filters": {
                "dealsFilter": "DEALS"
            }
        }
    }
    
    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Error scraping area {area['name']}: {e}")
        return []
    
    deals = []
    if data.get("status") == "success":
        feed_items = data.get("data", {}).get("feedItems", [])
        for item in feed_items:
            item_type = item.get("type", "")
            if item_type == "REGULAR_CAROUSEL":
                carousel = item.get("carousel", {})
                stores = carousel.get("stores", [])
                for store_item in stores:
                    deal = extract_deal_from_item(store_item)
                    deal["area_id"] = area["area_id"]
                    deals.append(deal)
            elif item_type == "REGULAR_STORE":
                # Pass the entire item so that we can check both top-level and nested "signposts".
                deal = extract_deal_from_item(item)
                deal["area_id"] = area["area_id"]
                deals.append(deal)
            else:
                # Optionally process other item types if necessary.
                continue
    else:
        print(f"Non-success status for {area['name']}: {data.get('status')}")
    
    return deals

# --- Main Routine ---

def main():
    all_deals = []
    for area in areas:
        print(f"Scraping deals for {area['name']}...")
        deals = scrape_area(area)
        print(f"Found {len(deals)} deal(s) in {area['name']}")
        all_deals.extend(deals)
        # Short delay to be polite with the server.
        time.sleep(1)
    
    # Save the collected deals to a JSON file.
    with open("uber_eats_deals.json", "w", encoding="utf-8") as f:
        json.dump(all_deals, f, ensure_ascii=False, indent=4)
    print("Scraping complete. Data saved to uber_eats_deals.json")

if __name__ == "__main__":
    main()