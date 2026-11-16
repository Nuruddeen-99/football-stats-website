import { useCallback, useEffect, useRef, useState } from "react";
import Loader from "../components/Loader";
import "../css/home.css";

const NEWS_API_URL = "https://newsapi.org/v2/everything";
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const PAGE_SIZE = 12;
const FALLBACK_IMAGE = "/logos/defaultimg.png";

// The default feed is limited to the top of the European game: major leagues,
// European competitions and the biggest clubs. Anything that only mentions
// "soccer" in passing (high-school finals, college round-ups, food blogs…) no
// longer makes the cut.
const TOP_FOOTBALL_QUERY = [
  '("premier league" OR "la liga" OR "serie a" OR bundesliga OR "ligue 1"',
  'OR "champions league" OR "europa league" OR "conference league"',
  'OR "nations league"',
  'OR ("world cup" AND (football OR soccer OR fifa))',
  'OR "real madrid" OR barcelona OR "manchester united" OR "manchester city"',
  'OR liverpool OR arsenal OR chelsea OR "bayern munich" OR "paris saint-germain"',
  'OR juventus OR "ac milan" OR "inter milan" OR napoli OR "atletico madrid")',
  'NOT rugby NOT NFL NOT "American football"',
].join(" ");

// Trusted football desks. Keeps the feed to proper football coverage instead of
// local newspapers and content farms.
const TOP_FOOTBALL_DOMAINS = [
  "bbc.co.uk",
  "bbc.com",
  "skysports.com",
  "espn.com",
  "espn.co.uk",
  "goal.com",
  "theguardian.com",
  "telegraph.co.uk",
  "independent.co.uk",
  "dailymail.co.uk",
  "mirror.co.uk",
  "standard.co.uk",
  "theathletic.com",
  "reuters.com",
  "apnews.com",
  "eurosport.com",
  "talksport.com",
  "football-italia.net",
  "marca.com",
  "as.com",
  "gazzetta.it",
  "lequipe.fr",
  "kicker.de",
  "sport1.de",
  "record.pt",
  "abola.pt",
  "ojogo.pt",
  "sport.es",
  "mundodeportivo.com",
  "fourfourtwo.com",
  "90min.com",
].join(",");

// Safety net for the odd non-football story that slips through the query.
const NON_FOOTBALL_CONTENT =
  /\b(?:high school|h\.s\.|ncaa|college|athlete of the week|volleyball|basketball|baseball|softball|little league|rugby|all blacks|cricket|wicket|the ashes|six nations|ice hockey|nhl|nba|nfl|tennis|wimbledon|golf|pga|formula one|motogp|darts|snooker)\b/i;

function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function prepareArticles(articles, { topOnly = false } = {}) {
  const seenUrls = new Set();
  const seenTitles = new Set();

  return (articles || []).filter((article) => {
    if (!article?.title || !article?.url) return false;

    // The same BBC story arrives from both bbc.co.uk and bbc.com.
    const urlKey = article.url.split("?")[0].toLowerCase();
    const titleKey = normalizeTitle(article.title);

    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) return false;

    if (
      topOnly &&
      NON_FOOTBALL_CONTENT.test(`${article.title} ${article.description || ""}`)
    ) {
      return false;
    }

    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    return true;
  });
}

function formatPublished(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();

  if (diffMs >= 0) {
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Home() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const requestRef = useRef(0);

  const loadNews = useCallback(async (query = "") => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    if (!NEWS_API_KEY) {
      setArticles([]);
      setError(
        "News is unavailable: add REACT_APP_NEWS_API_KEY to your .env file and restart the app."
      );
      setLoading(false);
      return;
    }

    // Searches use the exact phrase and are matched only against the title and
    // description. Combined with relevance sorting, this keeps results about
    // the searched club/player instead of articles that merely mention it in
    // passing. The default feed keeps the broader "soccer" query, newest first.
    const phrase = query.replace(/"/g, "").trim();

    const params = new URLSearchParams({
      q: phrase
        ? `"${phrase}" NOT rugby NOT NFL NOT "American football"`
        : TOP_FOOTBALL_QUERY,
      language: "en",
      sortBy: phrase ? "relevancy" : "publishedAt",
      pageSize: phrase ? "48" : "100",
      apiKey: NEWS_API_KEY,
      searchIn: "title,description",
    });

    if (!phrase) params.set("domains", TOP_FOOTBALL_DOMAINS);

    setLoading(true);
    setError(null);
    setVisibleCount(PAGE_SIZE);

    try {
      const response = await fetch(`${NEWS_API_URL}?${params.toString()}`);
      const data = await response.json();

      if (requestRef.current !== requestId) return;

      if (!response.ok || data.status !== "ok") {
        throw new Error(data.message || "Unable to load news right now.");
      }

      const list = prepareArticles(data.articles, { topOnly: !phrase });
      setArticles(list);
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setArticles([]);
      setError(err.message || "Unable to load news right now.");
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    setActiveQuery(query);
    loadNews(query);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveQuery("");
    loadNews();
  };

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <div className="home-layout">
      <aside className="search-panel">
        <h2>Search news</h2>
        <p>Find the latest stories about a club, player or topic.</p>

        <form onSubmit={handleSubmit} className="search-form">
          <label htmlFor="news-search" className="sr-only">
            Search news
          </label>
          <input
            id="news-search"
            type="search"
            className="input-search"
            placeholder="e.g. Champions League"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit" className="btn-primary">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            Search
          </button>
        </form>

        {activeQuery && (
          <button type="button" className="btn-secondary" onClick={clearSearch}>
            Clear
          </button>
        )}
      </aside>

      <section className="news-section" aria-live="polite">
        <div className="news-section-head">
          <h2>
            {activeQuery
              ? `Results for “${activeQuery}”`
              : "Trending football news"}
          </h2>
          {!loading && !error && articles.length > 0 && (
            <span>{articles.length} stories</span>
          )}
        </div>

        {loading ? (
          <Loader label="Fetching the latest stories…" />
        ) : error ? (
          <div className="alert" role="alert">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : visibleArticles.length === 0 ? (
          <div className="empty-state">
            <i
              className="fa-regular fa-newspaper"
              aria-hidden="true"
              style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}
            />
            {activeQuery
              ? `No news found for “${activeQuery}”. Try a different search.`
              : "No news stories are available right now."}
          </div>
        ) : (
          <>
            <div className="news-grid">
              {visibleArticles.map((article) => (
                <article className="news-card" key={article.url}>
                  <a
                    className="news-media"
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <img
                      src={article.urlToImage || FALLBACK_IMAGE}
                      alt=""
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </a>

                  <div className="news-body">
                    <span className="news-source">
                      {article.source?.name || "Football news"}
                    </span>
                    <h3>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {article.title}
                      </a>
                    </h3>
                    <div className="news-footer">
                      <span>
                        <i className="fa-regular fa-clock" aria-hidden="true" />
                        {formatPublished(article.publishedAt)}
                      </span>
                      <a
                        className="news-link"
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read more
                        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {visibleCount < articles.length && (
              <div className="load-more-wrap">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Load more stories
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
