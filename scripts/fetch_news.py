#!/usr/bin/env python3
"""Fetch latest war/conflict headlines from public RSS feeds -> src/data/articles.json
Only titles, short excerpts, thumbnails and links are stored; every card links to the original article."""
import json, re, subprocess, html, datetime, email.utils
import xml.etree.ElementTree as ET
from topics import tag

FEEDS = [
  ("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
  ("BBC News", "https://feeds.bbci.co.uk/news/world/rss.xml"),
  ("UN News", "https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml"),
  ("DW", "https://rss.dw.com/rdf/rss-en-world"),
]
KW = re.compile(r"\b(war|attack|strike|missile|drone|troops|military|army|ceasefire|gaza|ukrain\w*|russia\w*|israel\w*|hamas|sudan|iran\w*|lebanon|hezbollah|houthis?|yemen|siege|shell\w*|offensive|front-?line|nato|myanmar|syria\w*|west bank|hostages?|bomb\w*|invasion|conflict|fighting|ethiopia|prisoner-of-war)\b", re.I)
REGIONS = [
  ("Europe", r"ukrain|kyiv|russia|moscow|donbas|prisoner-of-war|belarus|poland|nato"),
  ("Middle East", r"iran|israel|gaza|west bank|yemen|houthi|lebanon|syria|hezbollah|riyadh|tehran|palestin"),
  ("Africa", r"sudan|ethiopia|congo|sahel|somalia|tigray|darfur"),
  ("Asia", r"myanmar|korea|taiwan|kashmir|afghan|pakistan|china"),
]
NS = {"media": "http://search.yahoo.com/mrss/", "dc": "http://purl.org/dc/elements/1.1/"}

def get(url):
    return subprocess.run(["curl", "-sL", "-m", "25", "-A", "Mozilla/5.0", url], capture_output=True, text=True).stdout

def og_image(url):
    h = get(url)
    m = (re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', h)
         or re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image', h))
    return html.unescape(m.group(1)) if m else ""

def hi_res(u):
    u = re.sub(r"/standard/\d+/", "/standard/976/", u)           # BBC
    if "aljazeera.com/wp-content" in u and "resize" not in u:     # Al Jazeera
        u += ("&" if "?" in u else "?") + "resize=1200%2C675"
    if u.startswith("//"): u = "https:" + u
    return u

def region(text):
    for name, rx in REGIONS:
        if re.search(rx, text, re.I): return name
    return "Global"

items = []
for src, feed in FEEDS:
    try: root = ET.fromstring(get(feed))
    except ET.ParseError: continue
    for it in root.iter("item"):
        g = lambda t: (it.findtext(t) or "").strip()
        title = html.unescape(g("title"))
        desc = html.unescape(re.sub(r"<[^>]+>", "", g("description"))).strip()
        if not KW.search(title + " " + desc): continue
        if re.search(r"ebola|vaccine|mtv|taylor swift|madonna|songs|helicopter|shootings|hijab|slovenia|inventors|frenemy|visit to abu dhabi|trade war|tariff|alcohol|dairy|stock|market", title, re.I): continue
        link = (g("link") or "").split("?")[0]
        img = ""
        for m in it.findall("media:content", NS) + it.findall("media:thumbnail", NS) + it.findall("enclosure"):
            if m.get("url"): img = m.get("url"); break
        date = g("pubDate") or g("dc:date")
        try: ts = email.utils.parsedate_to_datetime(date).timestamp()
        except Exception: ts = 0
        items.append(dict(source=src, title=title, excerpt=desc[:260], url=link, image=img, ts=ts, region=region(title + " " + desc), topics=tag(title + " " + desc)))

items.sort(key=lambda x: -x["ts"])
seen, out = set(), []
for o in items:
    k = re.sub(r"\W+", "", o["title"].lower())[:40]
    if k in seen: continue
    seen.add(k)
    if not o["image"]: o["image"] = og_image(o["url"])
    o["image"] = hi_res(o["image"]) if o["image"] else ""
    if not o["image"] or "facebook-default" in o["image"]: continue
    o["date"] = datetime.datetime.fromtimestamp(o["ts"], datetime.timezone.utc).strftime("%Y-%m-%d")
    out.append(o)
    if len(out) >= 12: break

if len(out) < 6:
    raise SystemExit(f"only {len(out)} articles fetched — keeping the previous articles.json")
json.dump(dict(fetched=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="minutes"), articles=out),
          open("src/data/articles.json", "w"), ensure_ascii=False, indent=1)
for o in out: print(o["date"], o["region"], "|", o["source"], "|", o["title"][:70])
