// API Configuration
const API_BASE = window.location.protocol === 'file:' || 
                 window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.hostname === ''
  ? 'http://localhost:5000'
  : 'https://trendingnews-nn9p.onrender.com';

// State
let allArticles = [];
let filteredArticles = [];

// DOM Elements
const articlesGrid = document.getElementById('articlesGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statsElement = document.getElementById('stats');
const lastUpdatedElement = document.getElementById('lastUpdated');

// Fetch articles
async function fetchArticles() {
  try {
    showLoading();
    
    const response = await fetch(`${API_BASE}/api/articles`);
    const data = await response.json();
    
    allArticles = data.articles || [];
    filteredArticles = allArticles;
    
    updateStats(data);
    renderArticles(filteredArticles);
    
    if (data.lastUpdated) {
      lastUpdatedElement.textContent = `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    showError();
  }
}

// Render articles
function renderArticles(articles) {
  if (articles.length === 0) {
    showNoResults();
    return;
  }

  articlesGrid.innerHTML = articles.map(article => `
    <article class="article-card" onclick="openArticle('${article.url}')">
      <img src="${article.image}" alt="${article.title}" class="article-image" onerror="this.src='https://via.placeholder.com/800x400/e0e0e0/666666?text=No+Image'">
      <div class="article-content">
        <span class="article-category">${article.category}</span>
        <h2 class="article-title">${article.title}</h2>
        <p class="article-summary">${article.summary.substring(0, 150)}...</p>
        <div class="article-meta">
          <span class="article-source">${article.source}</span>
          <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  `).join('');
}

// Filter articles
function filterArticles() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  filteredArticles = allArticles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm);
    
    const matchesCategory = !category || article.category === category;

    return matchesSearch && matchesCategory;
  });

  renderArticles(filteredArticles);
  updateStats({ articles: filteredArticles, count: filteredArticles.length });
}

// Update stats
function updateStats(data) {
  const count = data.count || data.articles?.length || 0;
  const cached = data.cached ? ' (cached)' : '';
  statsElement.textContent = `Showing ${count} articles${cached}`;
}

// Show loading
function showLoading() {
  articlesGrid.innerHTML = '<div class="loading">Loading articles...</div>';
}

// Show error
function showError() {
  articlesGrid.innerHTML = `
    <div class="no-results">
      <h2>Unable to load articles</h2>
      <p>Please check your connection and try again.</p>
      <button onclick="fetchArticles()">Retry</button>
    </div>
  `;
}

// Show no results
function showNoResults() {
  articlesGrid.innerHTML = `
    <div class="no-results">
      <h2>No articles found</h2>
      <p>Try adjusting your search or filter</p>
      <button onclick="clearFilters()">Show All</button>
    </div>
  `;
}

// Clear filters
function clearFilters() {
  searchInput.value = '';
  categoryFilter.value = '';
  filterArticles();
}

// Open article
function openArticle(url) {
  window.open(url, '_blank');
}

// Event listeners
searchInput.addEventListener('input', filterArticles);
categoryFilter.addEventListener('change', filterArticles);

// Initialize
fetchArticles();

// Auto-refresh every 5 minutes
setInterval(fetchArticles, 5 * 60 * 1000);
