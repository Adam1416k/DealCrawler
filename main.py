#!/usr/bin/env python3
import subprocess
import json
import sys
import os

# 1) run each scraper
def run_script(cmd):
    try:
        print(f"→ Running: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running {cmd}: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    # adjust these if your filenames differ
    scrapers = [
        (["python3", "foodora_scraper.py"], "foodora_deals.json", "foodora"),
        (["python3", "uber_scraper.py"],    "uber_deals.json",    "uber_eats"),
        (["python3", "wolt_scraper.py"],    "wolt_deals.json",    "wolt"),
    ]

    # make sure we're in the right dir
    base = os.path.dirname(__file__)
    os.chdir(base)

    # run each scraper
    for cmd, _, _ in scrapers:
        run_script(cmd)

    # 2) merge
    combined = []
    for _, fname, service in scrapers:
        if not os.path.exists(fname):
            print(f"Warning: {fname} not found, skipping", file=sys.stderr)
            continue
        with open(fname, encoding="utf-8") as f:
            data = json.load(f)
        for item in data:
            item["service"] = service
            combined.append(item)

    # 3) write master file
    out = "all_deals.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Done! Total deals: {len(combined)} → {out}")

if __name__ == "__main__":
    main()
