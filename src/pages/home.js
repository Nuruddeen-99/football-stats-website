import { useEffect, useState } from 'react';
import Header from '../components/header.js';
import '../css/home.css';

function Home() {
  const apiKey = process.env.REACT_APP_NEWS_API_KEY;
  const [news, setNews] = useState([]);
  const [searchTerm, setsearchTerm] = useState("");
  const [confirmedSearch, setConfirmedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      }); 
    }
  };  

  // Fetch default football news on initial page load
  useEffect(() => {
    const fetchFootballNews = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=+soccer NOT rugby NOT American football NOT NFL&language=en&sortBy=publishedAt&apiKey=${apiKey}`
        );
        const data = await response.json();
        setNews(data.articles);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFootballNews(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 8); 
  };

  const fetchSearchNews = async () => {
    if (!searchTerm.trim()) return;
    setConfirmedSearch(searchTerm); 
    setLoading(true);
    setVisibleCount(10);
    try {
      const query = `"${searchTerm.trim()}" AND soccer NOT rugby NOT "American football" NOT NFL`;
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${apiKey}`
      );
      const data = await response.json();
      setNews(data.articles);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
      setsearchTerm("");
    }
  };  

  return (
    <div>
      <Header />
      <h2 className='ht'>Trending Football News</h2>
      {confirmedSearch && <h2 className='ht'>Search Results for "{confirmedSearch}"</h2>}  
      <div className='con'>
        <div className='c1'>
          <span className='wg_header'>Search for news</span>
          <input
            id="search"
            type="text"
            placeholder="Search news about a topic or team"
            value={searchTerm}
            onChange={(e) => setsearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSearchNews()}
          />
          <button className='btn' onClick={fetchSearchNews}>Search</button>
        </div>

        <div className='c2'>
          {loading ? ( 
            <div className='wg_loader'></div>
          ) : news.length > 0 ? (
            <>
              {news.slice(0, visibleCount).map((article, index) => (
                <div className='news-item' key={index}>
                  <img src={article.urlToImage} alt='News' className='news-img' />
                  <div className='news-content'>
                    <div className='news-category'>{article.source.name}</div>
                    <h3>{article.title}</h3>
                    <div className='news-footer'>
                      <a className='rm' href={article.url} target='_blank' rel='noopener noreferrer'>Read More</a>
                      <span><i className="fa-regular fa-clock"></i> {getFormattedDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className='load-more-card' onClick={loadMore}>
                <div className='plus-circle'>+</div>
                <p>Load More</p>
              </div>
            </>
          ) : (
            <p className='ht'>No news found for "{searchTerm}"</p> 
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;