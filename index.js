const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});
app.get('/viewer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const limiter = rateLimit({ windowMs: 60 * 1000, max: 200 });
app.use(limiter);

const projects = [
  {
    id: "proj-1",
    title: "Smart Queue Manager",
    description: "Computer-vision powered queue analysis system using YOLOv8 for cart detection.",
    tags: ["Python", "YOLOv8", "Machine Learning", "Backend"],
    demo: "none",
    repo: "https://github.com/Lightzzz011/Smart-Queue-Manager",
    excerpt: "Trained a custom YOLOv8 model for cart detection and integrated the inference pipeline into the backend workflow.",
    created_at: "2025-10-12",
    difficulty: "Advanced"
  },
  {
    id: "proj-2",
    title: "Crazy Chess Analyzer",
    description: "A chess PGN analyzer that computes a 'craziness score' based on moves and patterns.",
    tags: ["JavaScript", "Chess.js", "Analysis"],
    demo: "none",
    repo: "https://github.com/Lightzzz011/crazyyychess",
    excerpt: "Implemented a scoring algorithm that evaluates how unconventional or chaotic a chess game is using PGN parsing.",
    created_at: "2025-06-20",
    difficulty: "Intermediate"
  },
  {
    id: "proj-3",
    title: "DriversProject",
    description: "Full-stack project for driver-related management with a hosted live frontend.",
    tags: ["React", "Next.js", "Frontend"],
    demo: "https://driveshort-1mp9uy0f2-sai-srinivas-projects-112b70ed.vercel.app/",
    repo: "https://github.com/Lightzzz011/DriversProject",
    excerpt: "Developed the entire project end-to-end including UI, routing, data handling and deployments.",
    created_at: "2025-07-15",
    difficulty: "Beginner"
  }
];

function filterAndPaginate(items, q, tag, page=1, perPage=10, sort='newest') {
  let out = items.slice();
  if (q) {
    const t = q.toLowerCase();
    out = out.filter(p => (p.title + ' ' + p.description + ' ' + p.excerpt).toLowerCase().includes(t));
  }
  if (tag) {
    out = out.filter(p => p.tags.map(x => x.toLowerCase()).includes(tag.toLowerCase()));
  }
  if (sort === 'newest') out.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
  if (sort === 'oldest') out.sort((a,b)=> new Date(a.created_at) - new Date(b.created_at));
  const total = out.length;
  const start = (page-1)*perPage;
  const pag = out.slice(start, start+perPage);
  return { data: pag, total, page, perPage };
}

app.get('/api/v1/projects', (req, res) => {
  const { q, tag, page, perPage, sort } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const per = Math.min(50, Number(perPage) || 10);
  const result = filterAndPaginate(projects, q, tag, pageNum, per, sort || 'newest');
  res.json({
    ok: true,
    meta: { total: result.total, page: result.page, perPage: result.perPage },
    data: result.data
  });
});

app.get('/api/v1/projects/:id', (req, res) => {
  const p = projects.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ ok:false, error: 'not_found' });
  res.json({ ok: true, data: p });
});

app.get('/api/v1/skills', (req, res) => {
  const tags = Array.from(new Set(projects.flatMap(p => p.tags))).sort();
  res.json({ ok: true, data: tags });
});

app.get('/api/v1/metrics', (req, res) => {
  const stats = {
    total_projects: projects.length,
    total_stars: 128 + Math.floor(Math.random()*50),
    total_forks: 24 + Math.floor(Math.random()*10),
    active_visitors_last_24h: 50 + Math.floor(Math.random()*200)
  };
  res.json({ ok: true, data: stats, generated_at: new Date().toISOString() });
});

app.post('/api/v1/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok:false, error:'missing_fields', need:['name','email','message'] });
  }
  res.json({ ok:true, message:'received', data:{ name, email, message }});
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok:false, error:'not_found' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`ProjectShowcase API running on port ${PORT}`));
