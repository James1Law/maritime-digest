from flask import Flask, jsonify
from flask_cors import CORS
from fetch_news import fetch_articles
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Cache configuration
cached_articles = []
last_fetch = None
CACHE_DURATION = timedelta(minutes=5)

@app.route("/api/news", methods=["GET"])
def get_news():
    global cached_articles, last_fetch
    
    # Check if cache is expired or empty
    if last_fetch is None or datetime.now() - last_fetch > CACHE_DURATION:
        # Fetch fresh data
        cached_articles = fetch_articles()
        last_fetch = datetime.now()
        print(f"Cache refreshed at {last_fetch}")
    else:
        print(f"Using cached data from {last_fetch}")
    
    return jsonify(cached_articles)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)