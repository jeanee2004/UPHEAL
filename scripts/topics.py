"""Keyword-based topic tags (ordered by relevance for legal work). Auto-tagging — always check the source."""
import re

TOPICS = [
  ("Accountability", r"\bICC\b|war crimes?|tribunal|\bcourt\b|\bjustice\b|accountab|investigat|fact-finding|genocide|human rights|rapporteur|prosecut|\bICJ\b|atrocit|violations?"),
  ("Displacement",   r"refugee|displac|\bfle(e|d|eing)\b|asylum|migrant|evacuat|returnee|forcibly|forced (out|from)|camps?\b|stateless"),
  ("Detention",      r"detain|arrest|prisoner|hostage|custody|\bPOWs?\b|abduct|disappear|jail|imprison"),
  ("Sanctions",      r"sanction|embargo|export control|asset freeze|frozen funds"),
  ("Humanitarian",   r"\baid\b|humanitarian|famine|hunger|cholera|ebola|starv|UNRWA|\bWFP\b|food (crisis|insecurity)|humanitarian access|aid (workers?|convoys?|access)"),
  ("Civilian harm",  r"civilian|killed|\bdead\b|deadly|\bdies?\b|\bdied\b|death toll|casualt|injur|shelling|massacre|wounded|hospital|school|demolition|destruction"),
  ("Ceasefire & talks", r"ceasefire|truce|\btalks\b|negotiat|peace (plan|deal|process)|mediat|accord|\bdeal\b"),
  ("Military",       r"offensive|troops|\barmy\b|drone|missile|front-?line|airstrike|air strike|attack|\bstrikes?\b|bomb"),
]

def tag(text, limit=3):
    return [name for name, rx in TOPICS if re.search(rx, text, re.I)][:limit]
