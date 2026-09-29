#!/usr/bin/env python3
"""UNHCR Refugee Data Finder API (free, no key) -> src/data/displacement.json
For each watchlist country: refugees / asylum-seekers who originate from it (summed over host countries),
IDPs inside it, and the top host countries — for the latest year that actually has data (recent years are often still empty)."""
import json, sys, time, datetime, urllib.request, urllib.parse

API = "https://api.unhcr.org/population/v1/population/"
# our watchlist name -> UNHCR's own country code (NOT ISO). None = not reported separately by UNHCR.
CODES = {"Ukraine": "UKR", "Sudan": "SUD", "Palestine": "GAZ", "Yemen": "YEM", "Iran": "IRN", "Myanmar": "MYA", "DR Congo": "COD",
         "Ethiopia": "ETH", "Somalia": "SOM", "Haiti": "HAI", "South Sudan": "SSD", "Syria": "SYR", "Lebanon": "LEB", "Taiwan": None}
NOTES = {"Palestine": "Excludes Palestine refugees registered with UNRWA; UNHCR does not report displacement inside Gaza / the West Bank.",
         "Taiwan": "UNHCR does not report Taiwan separately."}
YEARS = [2025, 2024, 2023, 2022]

SHORT = {"United Kingdom of Great Britain and Northern Ireland": "UK", "Netherlands (Kingdom of the)": "Netherlands", "Türkiye": "Türkiye", "United States of America": "USA", "Iran (Islamic Rep. of)": "Iran", "Syrian Arab Rep.": "Syria", "Dem. Rep. of the Congo": "DR Congo"}

def num(x):
    try: return int(x)
    except (TypeError, ValueError): return 0

def rows(code, year):
    out, page = [], 1
    while True:
        q = urllib.parse.urlencode({"year": year, "coo": code, "coa_all": "true", "limit": 500, "page": page})
        req = urllib.request.Request(f"{API}?{q}", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=40) as r: d = json.load(r)
        out += d.get("items", [])
        if page >= int(d.get("maxPages", 1) or 1): return out
        page += 1; time.sleep(0.3)

result, ok = {}, 0
for name, code in CODES.items():
    if code is None:
        result[name] = {"year": None, "note": NOTES.get(name)}; continue
    got = None
    for y in YEARS:
        try: rs = rows(code, y)
        except Exception as e: print(f"  {name} {y}: {e}", file=sys.stderr); continue
        ref, asy, idp = (sum(num(r.get(k)) for r in rs) for k in ("refugees", "asylum_seekers", "idps"))
        if ref + asy + idp > 0:
            hosts = sorted(({"name": SHORT.get(r["coa_name"], r["coa_name"]), "refugees": num(r.get("refugees"))} for r in rs if r.get("coa") != code), key=lambda x: -x["refugees"])[:3]
            got = {"year": y, "code": code, "refugees": ref, "asylumSeekers": asy, "idps": idp, "topHosts": [h for h in hosts if h["refugees"] > 0], **({"note": NOTES[name]} if name in NOTES else {})}
            break
        time.sleep(0.3)
    if got: ok += 1; print(f"{name:12} {got['year']}  refugees {got['refugees']:>10,}  asylum {got['asylumSeekers']:>9,}  IDPs {got['idps']:>10,}  hosts {[h['name'] for h in got['topHosts']]}")
    else: print(f"{name:12} no data"); got = {"year": None, "note": NOTES.get(name, "No UNHCR data found.")}
    result[name] = got
    time.sleep(0.4)

if ok < 8:  # network trouble — keep the previous file
    sys.exit(f"only {ok} countries returned data — keeping the previous displacement.json")
json.dump({"fetched": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="minutes"), "source": "UNHCR Refugee Data Finder (api.unhcr.org)", "items": result},
          open("src/data/displacement.json", "w"), ensure_ascii=False, indent=1)
