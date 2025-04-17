#!/usr/bin/env python3
import subprocess, json, sys, os

scrapers = [
    (["python3", "foodora_scraper.py"], "foodora_deals.json", "foodora"),
    (["python3", "uber_scraper.py"],    "uber_deals.json",    "uber_eats"),
    (["python3", "wolt_scraper.py"],    "wolt_deals.json",    "wolt"),
]

def clear_file(fname):
    with open(fname, "w", encoding="utf-8") as f:
        json.dump([], f)

def run_script(cmd):
    print(f"→ {' '.join(cmd)}")
    subprocess.run(cmd, check=True)

def main():
    base = os.path.dirname(__file__)
    os.chdir(base)

    # 1) clear each JSON
    for _, fname, _ in scrapers:
        clear_file(fname)

    # 2) run each scraper
    for cmd, _, _ in scrapers:
        run_script(cmd)

    # 3) merge as before…
    combined = []
    for _, fname, service in scrapers:
        with open(fname, encoding="utf-8") as f:
            for item in json.load(f):
                item["service"] = service
                combined.append(item)

    with open("all_deals.json", "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Done – {len(combined)} deals → all_deals.json")

if __name__=="__main__":
    main()
