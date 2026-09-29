#!/usr/bin/env python3
"""Per-country conflict / displacement headlines (Google News RSS, last 10 days) -> src/data/countries.json
The watchlist and tiers below are an editorial choice — edit COUNTRIES to change them."""
import json, re, html, subprocess, datetime, email.utils, urllib.parse
import xml.etree.ElementTree as ET
from topics import tag
from collections import Counter

# (name, flag, tier, search query)
COUNTRIES = [
  ("Ukraine",      "🇺🇦", "Active conflict", 'Ukraine war OR refugees OR displaced'),
  ("Sudan",        "🇸🇩", "Active conflict", 'Sudan war OR refugees OR famine'),
  ("Palestine",    "🇵🇸", "Active conflict", 'Gaza OR "West Bank" humanitarian OR displaced OR ceasefire'),
  ("Yemen",        "🇾🇪", "Active conflict", 'Yemen Houthis OR fighting OR displacement'),
  ("Iran",         "🇮🇷", "Active conflict", 'Iran war OR strikes OR talks'),
  ("Myanmar",      "🇲🇲", "Active conflict", 'Myanmar conflict OR junta OR Rohingya'),
  ("DR Congo",     "🇨🇩", "Active conflict", 'Congo M23 OR fighting OR displaced'),
  ("Ethiopia",     "🇪🇹", "Active conflict", 'Ethiopia fighting OR Tigray OR Amhara'),
  ("Somalia",      "🇸🇴", "Active conflict", 'Somalia al-Shabaab OR displacement OR drought'),
  ("Haiti",        "🇭🇹", "Active conflict", 'Haiti gangs OR displaced OR violence'),
  ("South Sudan",  "🇸🇸", "Elevated risk",   '"South Sudan" fighting OR tensions OR refugees'),
  ("Syria",        "🇸🇾", "Elevated risk",   'Syria transition OR clashes OR returnees'),
  ("Lebanon",      "🇱🇧", "Elevated risk",   'Lebanon Hezbollah OR Israel OR strikes'),
  ("Taiwan",       "🇹🇼", "Elevated risk",   'Taiwan China military OR tensions'),
]
PER = 6
CONTINENT = {'Ukraine': 'Europe', 'Sudan': 'Africa', 'Palestine': 'Middle East', 'Yemen': 'Middle East', 'Iran': 'Middle East', 'Myanmar': 'Asia', 'DR Congo': 'Africa', 'Ethiopia': 'Africa', 'Somalia': 'Africa', 'Haiti': 'Americas', 'South Sudan': 'Africa', 'Syria': 'Middle East', 'Lebanon': 'Middle East', 'Taiwan': 'Asia'}

def get(url):
    return subprocess.run(["curl", "-sL", "-m", "25", "-A", "Mozilla/5.0", url], capture_output=True, text=True).stdout

out, now = [], datetime.datetime.now(datetime.timezone.utc)
for name, flag, tier, q in COUNTRIES:
    url = "https://news.google.com/rss/search?q=" + urllib.parse.quote_plus(q + " when:10d") + "&hl=en-US&gl=US&ceid=US:en"
    try: root = ET.fromstring(get(url))
    except ET.ParseError: continue
    items, seen = [], set()
    for it in root.iter("item"):
        title = html.unescape(it.findtext("title") or "")
        src = it.find("source"); source = html.unescape(src.text) if src is not None and src.text else ""
        if source and title.endswith(" - " + source): title = title[: -len(source) - 3]
        key = re.sub(r"\W+", "", title.lower())[:45]
        if not title or key in seen: continue
        seen.add(key)
        try: ts = email.utils.parsedate_to_datetime(it.findtext("pubDate")).timestamp()
        except Exception: continue
        items.append(dict(topics=tag(title), title=title, source=source, url=it.findtext("link"), ts=ts, date=datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).strftime("%Y-%m-%d")))
    items.sort(key=lambda x: -x["ts"])
    last7 = sum(1 for x in items if now.timestamp() - x["ts"] < 7 * 86400)
    top = [t for t, _ in Counter(t for x in items for t in x['topics']).most_common(4)]
    out.append(dict(name=name, flag=flag, tier=tier, continent=CONTINENT[name], count=len(items), last7=last7, topTopics=top, articles=items[:PER]))
    print(f"{flag} {name:12} {tier:16} {len(items):3} items")

if sum(1 for c in out if c['articles']) < 8:
    raise SystemExit('too few countries returned articles — keeping the previous countries.json')
json.dump(dict(fetched=now.isoformat(timespec="minutes"), countries=out), open("src/data/countries.json", "w"), ensure_ascii=False, indent=1)
