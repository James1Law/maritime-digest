import feedparser
import html

FEEDS = [
    "https://www.marinelink.com/rss/allnews",
    "https://www.seatrade-maritime.com/rss.xml",
    "https://splash247.com/feed/",
    "https://gcaptain.com/feed/",
    "https://www.marinetraffic.com/en/maritime-news/rss"
]

# Expanded category keyword mappings for maritime news
CATEGORY_KEYWORDS = {
    "Green Tech": [
        "green", "emissions", "hydrogen", "fuel", "decarbon", "carbon", "climate", "renewable", "wind", "solar", "battery", "electric", "lng", "methanol", "ammonia", "scrubber", "sustainability", "esg"
    ],
    "Automation": [
        "autonomous", "robot", "automation", "machine", "unmanned", "remote", "drone", "rov", "auv", "sensor", "smart", "navigation", "autopilot"
    ],
    "AI & Analytics": [
        "ai", "artificial intelligence", "ml", "machine learning", "analytics", "predictive", "algorithm", "data", "big data", "digital twin", "simulation", "optimization", "forecast"
    ],
    "Digital Innovation": [
        "digital", "platform", "software", "saas", "app", "cloud", "iot", "connectivity", "cyber", "fintech", "e-navigation", "e-logistics", "e-documents"
    ],
    "Blockchain": [
        "blockchain", "ledger", "crypto", "token", "smart contract"
    ],
    "Port & Logistics": [
        "port", "terminal", "logistics", "supply chain", "container", "intermodal", "cargo", "freight", "throughput", "handling", "storage", "warehouse", "distribution", "customs"
    ],
    "Regulation & Policy": [
        "imo", "regulation", "policy", "law", "compliance", "solas", "marpol", "convention", "standard", "rule", "guideline", "authority", "government", "ban", "restriction", "safety", "security"
    ],
    "Finance & Investment": [
        "finance", "investment", "funding", "capital", "ipo", "acquisition", "merger", "buyout", "private equity", "venture", "grant", "subsidy", "insurance", "risk", "market", "stock", "share", "bond", "loan", "credit"
    ],
    "People & Careers": [
        "crew", "seafarer", "officer", "captain", "training", "education", "job", "career", "union", "welfare", "health", "diversity", "leadership", "hr", "recruitment"
    ],
    "Vessels & Fleets": [
        "ship", "vessel", "fleet", "tanker", "bulker", "container", "ferry", "cruise", "yacht", "barge", "tug", "newbuild", "retrofit", "scrapping", "delivery", "order", "launch", "design", "hull", "engine", "propulsion", "maintenance", "repair", "drydock", "conversion", "upgrade", "incident", "accident", "casualty", "grounding", "collision", "fire", "rescue", "salvage", "piracy", "hijack", "loss", "sinking", "distress", "emergency", "sar"
    ]
}

def assign_categories(article):
    """
    Assign categories to an article based on keywords in title and summary.
    Returns a list of matching category names.
    """
    # Convert text to lowercase for case-insensitive matching
    text = f"{article['title']} {article['summary']}".lower()
    
    # Find matching categories
    categories = set()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            categories.add(category)
    
    # Return 'General' if no matches found
    return list(categories) if categories else ["General"]

def fetch_articles(limit_per_feed=3):
    articles = []

    for url in FEEDS:
        feed = feedparser.parse(url)
        for entry in feed.entries[:limit_per_feed]:
            source = feed.feed.get("title", "Unknown Source")
            
            # Create article dictionary
            summary = html.unescape(entry.summary) if "summary" in entry else ""
            article = {
                "title": entry.title,
                "link": entry.link,
                "summary": summary,
                "source": source
            }
            
            # Assign categories
            article["category"] = assign_categories(article)
            
            articles.append(article)

    return articles