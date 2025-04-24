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
    # 1) determine where we are
    base = os.path.dirname(__file__)                  # .../DealCrawler/Scrapers
    project_root = os.path.abspath(os.path.join(base, os.pardir))  
                                                     # .../DealCrawler

    # 2) clear each JSON in Scrapers/
    os.chdir(base)
    for _, fname, _ in scrapers:
        clear_file(fname)

    # 3) run each scraper
    for cmd, _, _ in scrapers:
        run_script(cmd)

    # 4) merge results
    combined = []
    for _, fname, service in scrapers:
        with open(os.path.join(base, fname), encoding="utf-8") as f:
            for item in json.load(f):
                item["service"] = service
                combined.append(item)

    # 5) ensure frontend/public exists, then write out
    out_dir = os.path.join(project_root, "frontend", "public")
    os.makedirs(out_dir, exist_ok=True)

    out_path = os.path.join(out_dir, "all_deals.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Done – {len(combined)} deals → {out_path!r}")

if __name__=="__main__":
    main()
