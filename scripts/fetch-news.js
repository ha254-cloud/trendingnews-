import Parser from 'rss-parser';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  timeout: 15000,
  headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
});
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'articles.json');

// Comprehensive African RSS Feeds (tested and verified)
const RSS_FEEDS = [
  // Pan-African News
  { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', name: 'AllAfrica' },
  
  // International coverage of Africa
  { url: 'https://www.theguardian.com/world/africa/rss', name: 'The Guardian Africa' },
  { url: 'https://www.france24.com/en/africa/rss', name: 'France 24 Africa' },
  { url: 'https://www.dw.com/en/africa/s-12297/rss', name: 'Deutsche Welle Africa' },
  { url: 'https://www.voanews.com/api/zq-jveqmpi', name: 'Voice of America Africa' },
  { url: 'https://www.bbc.com/news/world/africa/rss.xml', name: 'BBC Africa' },
  { url: 'https://www.africanews.com/feed/', name: 'Africanews' },
  { url: 'https://www.reuters.com/world/africa/', name: 'Reuters Africa' },
  
  // Country-specific - South Africa
  { url: 'https://www.sabcnews.com/sabcnews/feed/', name: 'SABC News South Africa' },
  { url: 'https://www.iol.co.za/rss/news', name: 'IOL South Africa' },
  { url: 'https://www.news24.com/news24/southafrica/rss', name: 'News24 South Africa' },
  { url: 'https://www.timeslive.co.za/rss/', name: 'Times Live South Africa' },
  { url: 'https://ewn.co.za/RSS%20Feeds/RSS', name: 'EWN South Africa' },
  
  // Country-specific - East Africa
  { url: 'https://www.monitor.co.ug/rss/news.rss', name: 'Daily Monitor Uganda' },
  { url: 'https://www.standardmedia.co.ke/rss/headlines.php', name: 'The Standard Kenya' },
  { url: 'https://www.nation.co.ke/kenya/news/rss', name: 'Daily Nation Kenya' },
  { url: 'https://www.theeastafrican.co.ke/tea/rss', name: 'The East African' },
  { url: 'https://www.newtimes.co.rw/rss', name: 'The New Times Rwanda' },
  { url: 'https://www.thecitizen.co.tz/tanzania/rss', name: 'The Citizen Tanzania' },
  
  // Country-specific - West Africa
  { url: 'https://www.ghanaweb.com/GhanaHomePage/rss/news.xml', name: 'GhanaWeb' },
  { url: 'https://www.graphic.com.gh/news.feed', name: 'Daily Graphic Ghana' },
  { url: 'https://punchng.com/feed/', name: 'Punch Nigeria' },
  { url: 'https://www.premiumtimesng.com/feed', name: 'Premium Times Nigeria' },
  { url: 'https://www.vanguardngr.com/feed/', name: 'Vanguard Nigeria' },
  { url: 'https://www.channelstv.com/feed/', name: 'Channels TV Nigeria' },
  
  // Country-specific - North Africa
  { url: 'https://www.egypttoday.com/RSS', name: 'Egypt Today' },
  { url: 'https://www.middleeasteye.net/countries/africa.rss', name: 'Middle East Eye Africa' },
  
  // Business & Economy
  { url: 'https://www.businesslive.co.za/rss/?publication=business-day', name: 'Business Day' },
  { url: 'https://www.howwemadeitinafrica.com/feed/', name: 'How We Made It In Africa' },
  { url: 'https://www.businessinsider.co.za/feeds/rss', name: 'Business Insider SA' },
  { url: 'https://africanindy.com/feed/', name: 'African Independent' },
  
  // Tech & Innovation
  { url: 'https://techpoint.africa/feed/', name: 'Techpoint Africa' },
  { url: 'https://disrupt-africa.com/feed/', name: 'Disrupt Africa' },
  { url: 'https://techcrunch.com/tag/africa/feed/', name: 'TechCrunch Africa' },
  { url: 'https://ventureburn.com/feed/', name: 'Ventureburn' },
  
  // Sports
  { url: 'https://www.supersport.com/rss/news.xml', name: 'SuperSport' },
  { url: 'https://www.goal.com/en-za/feeds/news', name: 'Goal Africa' },
  
  // General/Mixed
  { url: 'https://africanarguments.org/feed/', name: 'African Arguments' },
  { url: 'https://qz.com/africa/feed', name: 'Quartz Africa' },
  { url: 'https://theconversation.com/africa/articles.atom', name: 'The Conversation Africa' },
];

// Comprehensive synonym replacement for full rewriting
const SYNONYMS = {
  verbs: {
    'said': ['stated', 'mentioned', 'remarked', 'noted', 'expressed', 'indicated', 'commented', 'observed'],
    'has': ['possesses', 'holds', 'maintains', 'owns', 'retains', 'contains'],
    'announced': ['declared', 'revealed', 'disclosed', 'proclaimed', 'unveiled', 'confirmed'],
    'reported': ['documented', 'recorded', 'detailed', 'chronicled', 'noted', 'indicated'],
    'showed': ['demonstrated', 'displayed', 'exhibited', 'revealed', 'illustrated', 'presented'],
    'told': ['informed', 'advised', 'notified', 'communicated to', 'relayed to', 'conveyed to'],
    'went': ['traveled', 'proceeded', 'moved', 'journeyed'],
    'came': ['arrived', 'appeared', 'emerged', 'approached'],
    'made': ['created', 'produced', 'formed', 'generated', 'constructed'],
    'took': ['seized', 'grabbed', 'captured', 'acquired', 'obtained'],
    'gave': ['provided', 'offered', 'delivered', 'supplied', 'granted'],
    'found': ['discovered', 'located', 'identified', 'detected', 'uncovered'],
    'called': ['named', 'termed', 'labeled', 'referred to as', 'designated'],
    'asked': ['inquired', 'questioned', 'requested', 'queried'],
    'following': ['after', 'subsequent to', 'in the wake of', 'succeeding'],
    'including': ['comprising', 'encompassing', 'containing', 'involving'],
    'according to': ['as per', 'based on', 'in line with', 'following'],
    'due to': ['because of', 'owing to', 'as a result of', 'caused by'],
  },
  nouns: {
    'president': ['head of state', 'leader', 'chief executive', 'national leader'],
    'government': ['administration', 'authorities', 'regime', 'ruling body'],
    'people': ['citizens', 'residents', 'population', 'individuals', 'inhabitants'],
    'country': ['nation', 'state', 'territory', 'sovereign state'],
    'economy': ['economic sector', 'financial system', 'market', 'economic landscape'],
    'minister': ['cabinet member', 'official', 'secretary', 'government official'],
    'officials': ['authorities', 'administrators', 'representatives', 'government figures'],
    'police': ['law enforcement', 'authorities', 'security forces'],
    'military': ['armed forces', 'defense forces', 'security apparatus'],
    'protesters': ['demonstrators', 'activists', 'rally participants'],
    'election': ['vote', 'poll', 'ballot', 'electoral process'],
    'meeting': ['conference', 'gathering', 'session', 'assembly'],
    'report': ['document', 'study', 'analysis', 'assessment'],
    'statement': ['declaration', 'announcement', 'pronouncement', 'communication'],
    'plan': ['strategy', 'proposal', 'initiative', 'scheme'],
    'program': ['initiative', 'project', 'scheme', 'undertaking'],
    'issue': ['matter', 'concern', 'topic', 'subject'],
    'crisis': ['emergency', 'critical situation', 'urgent matter'],
  },
  adjectives: {
    'new': ['fresh', 'recent', 'latest', 'novel', 'contemporary'],
    'big': ['large', 'substantial', 'significant', 'major', 'considerable'],
    'important': ['significant', 'crucial', 'vital', 'essential', 'key'],
    'good': ['positive', 'favorable', 'beneficial', 'advantageous'],
    'bad': ['negative', 'unfavorable', 'adverse', 'detrimental'],
    'major': ['significant', 'substantial', 'considerable', 'primary'],
    'key': ['crucial', 'essential', 'vital', 'critical', 'primary'],
    'main': ['primary', 'principal', 'chief', 'leading'],
    'current': ['present', 'ongoing', 'existing', 'contemporary'],
    'recent': ['latest', 'fresh', 'new', 'contemporary'],
    'local': ['regional', 'domestic', 'native', 'indigenous'],
    'national': ['countrywide', 'nationwide', 'state-level'],
    'international': ['global', 'worldwide', 'cross-border'],
  }
};

// Advanced rewriting function with sentence restructuring
function rewriteText(text) {
  if (!text || text.length < 10) return text;
  
  let rewritten = text;
  
  // Step 1: Replace synonyms (words)
  Object.entries(SYNONYMS).forEach(([type, words]) => {
    Object.entries(words).forEach(([original, replacements]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      rewritten = rewritten.replace(regex, (match) => {
        const replacement = replacements[Math.floor(Math.random() * replacements.length)];
        // Preserve original case
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    });
  });
  
  // Step 2: Sentence restructuring patterns
  const patterns = [
    // "X said Y" -> "Y, X stated"
    { from: /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+said\s+"([^"]+)"/, to: '"$2," $1 stated' },
    { from: /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+announced\s+that\s+/, to: 'According to $1, ' },
    // "will be" -> "is expected to be" / "is set to be"
    { from: /\bwill be\b/g, to: () => ['is expected to be', 'is set to be', 'is scheduled to be'][Math.floor(Math.random() * 3)] },
    { from: /\bwill have\b/g, to: () => ['is expected to have', 'is set to have'][Math.floor(Math.random() * 2)] },
  ];
  
  patterns.forEach(pattern => {
    if (typeof pattern.to === 'function') {
      rewritten = rewritten.replace(pattern.from, pattern.to);
    } else {
      rewritten = rewritten.replace(pattern.from, pattern.to);
    }
  });
  
  return rewritten;
}

// Rewrite title specifically (more aggressive)
function rewriteTitle(title) {
  if (!title) return 'Untitled';
  
  let rewritten = title;
  
  // Apply all synonym replacements
  Object.entries(SYNONYMS).forEach(([type, words]) => {
    Object.entries(words).forEach(([original, replacements]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      rewritten = rewritten.replace(regex, (match) => {
        const replacement = replacements[Math.floor(Math.random() * replacements.length)];
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    });
  });
  
  return rewritten;
}

async function fetchRSSFeeds() {
  const articles = [];
  let successCount = 0;
  let failCount = 0;

  console.log(`📡 Fetching from ${RSS_FEEDS.length} RSS feeds...\n`);

  for (const feed of RSS_FEEDS) {
    try {
      console.log(`⏳ Fetching: ${feed.name}...`);
      const parsedFeed = await parser.parseURL(feed.url);
      const itemCount = parsedFeed.items?.length || 0;
      
      if (itemCount > 0) {
        console.log(`✅ ${feed.name}: ${itemCount} articles`);
        successCount++;
        
        parsedFeed.items.forEach((item, index) => {
          const content = item.contentSnippet || item.content || item.summary || item.description || '';
          const cleanContent = content.replace(/<[^>]*>/g, '').trim();
          const originalTitle = item.title?.trim() || 'Untitled';
          
          articles.push({
            id: `${feed.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
            title: rewriteTitle(originalTitle), // Rewrite title
            summary: rewriteText(cleanContent.substring(0, 250)) + '...', // Rewrite summary
            content: rewriteText(cleanContent), // Rewrite full content
            image: item.enclosure?.url || 
                   item['media:thumbnail']?.$ ?.url ||
                   item['media:content']?.$ ?.url ||
                   'https://via.placeholder.com/800x400/2c3e50/ffffff?text=African+News',
            source: feed.name,
            url: item.link || item.guid || '',
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            category: item.categories?.[0] || 'General',
            rewritten: true
          });
        });
      } else {
        console.log(`⚠️  ${feed.name}: No articles found`);
      }
    } catch (error) {
      console.error(`❌ ${feed.name}: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} successful, ${failCount} failed\n`);
  return articles;
}

async function main() {
  console.log('🌍 Fetching African news from RSS feeds...\n');

  try {
    // Fetch from RSS feeds only
    const rssArticles = await fetchRSSFeeds();

    // Deduplicate by URL
    const uniqueArticles = Array.from(
      new Map(rssArticles.map(a => [a.url, a])).values()
    ).slice(0, 500); // Keep top 500

    // Ensure data directory exists
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

    // Save to file
    const data = {
      articles: uniqueArticles,
      lastUpdated: new Date().toISOString(),
      count: uniqueArticles.length,
      sources: RSS_FEEDS.map(f => f.name)
    };

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2));

    console.log(`✅ Successfully saved ${uniqueArticles.length} unique articles`);
    console.log(`📁 Output: ${OUTPUT_FILE}`);
    console.log(`🕒 Updated: ${data.lastUpdated}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
