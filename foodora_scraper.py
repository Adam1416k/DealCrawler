from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import json
import time

def scrape_foodora_deals_playwright():
    with sync_playwright() as p:
        # Use "headful" mode but move browser off-screen
        browser = p.chromium.launch(
            headless=False,
            args=["--window-position=0,10000"]
        )
        page = browser.new_page(locale="sv-SE")

        url = "https://www.foodora.se/restaurants/new?lat=59.315030489085814&lng=18.19989712571292&has_free_delivery=1&is_voucher_enabled=1&has_discount=1"
        page.goto(url)

        # Wait for JS to load and scroll to trigger dynamic rendering
        time.sleep(5)
        page.mouse.wheel(0, 2000)
        time.sleep(5)

        # Confirm content is visible
        try:
            page.wait_for_selector("li.vendor-tile-new-l", timeout=10000)
        except Exception:
            print("⚠️ Still couldn’t find deal tiles, exiting.")
            browser.close()
            return

        # Scrape HTML
        soup = BeautifulSoup(page.content(), "html.parser")
        cards = soup.find_all("li", class_="vendor-tile-new-l")
        deals = []

        for card in cards:
            a_tag = card.find("a", href=True)
            name_tag = card.find("div", class_="vendor-name")
            discount_tag = card.find("span", class_="bds-c-tag__label")
            delivery_tag = card.find("div", class_="vendor-info-row-text")

            name = name_tag.get_text(strip=True) if name_tag else None
            discount = discount_tag.get_text(strip=True) if discount_tag and "rabatt" in discount_tag.text.lower() else None
            delivery = delivery_tag.get_text(strip=True) if delivery_tag else None
            link = f"https://www.foodora.se{a_tag['href']}" if a_tag else None

            if name:
                deals.append({
                    "name": name,
                    "discount": discount,
                    "delivery_time": delivery,
                    "link": link
                })

        with open("foodora_deals.json", "w", encoding="utf-8") as f:
            json.dump(deals, f, indent=2, ensure_ascii=False)

        print(f"✅ Found {len(deals)} deals and saved to foodora_deals.json")
        browser.close()

if __name__ == "__main__":
    scrape_foodora_deals_playwright()
