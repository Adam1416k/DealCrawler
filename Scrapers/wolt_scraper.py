import requests
import json
import time

# Headers to mimic a browser request – update these if needed.
headers = {
    "accept": "application/json, text/plain, */*",
    "app-currency-format": "wqQxLDIzNC41Ng==",
    "app-language": "en",
    "client-version": "1.15.1-PR16823",
    "clientversionnumber": "1.15.1-PR16823",
    "origin": "https://wolt.com",
    "platform": "Web",
    "user-agent": "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 CrKey/1.54.250320"
}

# Define the areas with coordinates (extend this list to around 40 areas as needed).
areas = [
    {"name": "13145", "lat": 59.315202, "lon": 18.200045},
    {"name": "13563", "lat": 59.25424, "lon": 18.276526}
    # ... add more areas here
]

all_deals = []  # List to hold deals from all areas.

for area in areas:
    # Construct the API URL using the current area's coordinates.
    url = f"https://consumer-api.wolt.com/v1/pages/venue-list/promotions-near-you?lon={area['lon']}&lat={area['lat']}"
    print(f"\nScraping deals for {area['name']} at coordinates (lat: {area['lat']}, lon: {area['lon']})")

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Error fetching data for {area['name']}: {e}")
        continue

    # Debug: Print top-level keys of the returned JSON to inspect its structure.
    if isinstance(data, dict):
        print(f"Response keys for {area['name']}: {list(data.keys())}")

    # Try to extract the list of deals. Adjust extraction according to JSON structure.
    deals = []
    if isinstance(data, dict):
        if "items" in data:
            deals = data["items"]
        elif "sections" in data:
            for section in data["sections"]:
                section_deals = section.get("items", [])
                deals.extend(section_deals)
        elif "title" in data:
            deals = [data]
        else:
            print(f"Unrecognized JSON structure for {area['name']}. Please inspect the keys above.")
    elif isinstance(data, list):
        deals = data
    else:
        print("Unrecognized JSON data format.")

    print(f"Found {len(deals)} deals for {area['name']}.")

    for deal in deals:
        # Extract fields from each deal.
        name = deal.get("title") or deal.get("venue", {}).get("name", "")
        link = deal.get("link", {}).get("target", "")
        image = deal.get("image", {}).get("url", "")

        # Combine promotions if available.
        promotions = deal.get("venue", {}).get("promotions", [])
        if promotions:
            promotion_texts = [promo.get("text", "") for promo in promotions if promo.get("text")]
            deal_type = ", ".join(promotion_texts)
        else:
            deal_type = ""

        # Get rating information.
        rating_obj = deal.get("venue", {}).get("rating", {})
        rating = str(rating_obj.get("rating", ""))
        rating_count = f"({rating_obj.get('volume', '')})" if rating_obj.get("volume") else ""

        # Extract delivery time info.
        delivery_time = deal.get("venue", {}).get("estimate_box", {}).get("title", "")

        # ————————— NEW: extract cuisine type —————————
        # 1) Try the deal-level filtering "primary" values
        cuisine = ""
        filtering = deal.get("filtering", {}).get("filters", [])
        for f in filtering:
            if f.get("id") == "primary":
                vals = f.get("values", [])
                if vals:
                    cuisine = vals[0]
                break
        # 2) Fallback to venue tags
        if not cuisine:
            tags = deal.get("venue", {}).get("tags", [])
            if isinstance(tags, list) and tags:
                cuisine = tags[0]
        # ————————————————————————————————

        # Build the deal record
        deal_item = {
            "area_id":      area["name"],
            "name":         name,
            "link":         link,
            "image":        image,
            "deal_type":    deal_type,
            "rating":       rating,
            "rating_count": rating_count,
            "delivery_time":delivery_time,
            "cuisine":      cuisine,  # newly added field
        }
        all_deals.append(deal_item)

    # Pause to reduce request rate.
    time.sleep(1)

# Save all deals with the area id to a JSON file.
output_filename = "wolt_deals.json"
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(all_deals, f, ensure_ascii=False, indent=4)

print(f"\nScraping complete. Results saved to {output_filename}")
