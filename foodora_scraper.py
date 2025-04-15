from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import json
import time

def scrape_foodora_deals_playwright():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=["--window-position=0,10000"]
        )
        page = browser.new_page(locale="sv-SE")

        url = "https://www.foodora.se/restaurants/new?lat=59.315030489085814&lng=18.19989712571292&has_discount=1"
        page.goto(url)

        time.sleep(5)
        page.mouse.wheel(0, 3000)
        time.sleep(5)

        try:
            page.wait_for_selector("li.vendor-tile-new-l", timeout=10000)
        except Exception:
            print("⚠️ Still couldn’t find deal tiles, exiting.")
            browser.close()
            return

        soup = BeautifulSoup(page.content(), "html.parser")
        cards = soup.find_all("li", class_="vendor-tile-new-l")
        deals = []

        for card in cards:
            a_tag = card.find("a", href=True)
            name_tag = card.find("div", class_="vendor-name")
            deal_type_tag = card.find("div", class_="bds-c-tag--variant-gradient")
            rating_tag = card.find("span", class_="bds-c-rating__label-primary")
            rating_count_tag = card.find("span", class_="bds-c-rating__label-secondary")
            image_tag = card.find("img", class_="vendor-tile-revamped-image")

            # Info tags
            info_rows = card.find_all("div", class_="vendor-info-row-text")
            delivery_time = None
            price_range = None
            category = None

            for row in info_rows:
                text = row.get_text(strip=True)
                if "min" in text:
                    delivery_time = text
                elif text in {"$", "$$", "$$$"}:
                    price_range = text
                elif len(text) > 1 and not text.startswith("Fri") and not category:
                    category = text

            name = name_tag.get_text(strip=True) if name_tag else None
            deal_type = deal_type_tag.get_text(strip=True) if deal_type_tag else None
            rating = rating_tag.get_text(strip=True) if rating_tag else None
            rating_count = rating_count_tag.get_text(strip=True).strip("()") if rating_count_tag else None
            link = f"https://www.foodora.se{a_tag['href']}" if a_tag else None
            image = image_tag["src"] if image_tag else None

            if name:
                deals.append({
                    "name": name,
                    "deal_type": deal_type,
                    "delivery_time": delivery_time,
                    "price_range": price_range,
                    "category": category,
                    "rating": rating,
                    "rating_count": rating_count,
                    "image": image,
                    "link": link
                })

        with open("foodora_deals.json", "w", encoding="utf-8") as f:
            json.dump(deals, f, indent=2, ensure_ascii=False)

        print(f"✅ Found {len(deals)} deals and saved to foodora_deals.json")
        browser.close()

if __name__ == "__main__":
    scrape_foodora_deals_playwright()
