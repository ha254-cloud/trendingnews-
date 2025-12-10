# African News Site

Professional full-stack news aggregator with auto-refresh capabilities.

## 🚀 Features

- **Auto-refresh**: News updates every 6 hours automatically
- **Professional rewriting**: Advanced synonym replacement to avoid copyright issues
- **12+ RSS sources**: BBC, Reuters, Al Jazeera, AllAfrica, Guardian, News24, and more
- **Clean API**: RESTful endpoints with caching
- **Responsive frontend**: Mobile-friendly design
- **Search & filter**: Real-time article filtering

## 📁 Project Structure

```
african-news-site/
├── server.js              # Express API server
├── scripts/
│   └── fetch-news.js      # Article fetching & rewriting
├── frontend/              # Static website files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data/
│   └── articles.json      # Generated articles data
└── .env                   # Environment variables
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env`:
```
PORT=5000
NODE_ENV=development
```

### 3. Run Locally

```bash
npm start
```

Backend: http://localhost:5000
Frontend: Open `frontend/index.html` in browser

## 🌐 Deployment

### Backend (Render)

1. Push to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: None required (all RSS feeds are free)
5. Copy your Render URL

### Frontend (FileZilla/Hosting)

1. Open `frontend/app.js`
2. Update line 3:
   ```js
   const API_BASE = 'https://your-backend-url.onrender.com';
   ```
3. Upload `frontend/*` files to your hosting

## 📡 API Endpoints

- `GET /health` - Health check
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get single article
- `POST /api/refresh` - Manual refresh (triggers fetch)

## 🔄 Auto-Refresh

Cron schedule: `0 */6 * * *` (every 6 hours)

Manual trigger:
```bash
npm run fetch
```

Or via API:
```bash
curl -X POST http://localhost:5000/api/refresh
```

## 📝 License

ISC
