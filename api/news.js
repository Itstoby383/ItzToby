module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verify admin token
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const APP_ID = 'app_XnOUnf_n2Js1';
  const BASE   = 'https://api.itisnow.net/api/data/news';

  // GET — list news
  if (req.method === 'GET') {
    const r = await fetch(BASE + '?limit=100', {
      headers: { 'X-App-Id': APP_ID }
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  // POST — create news item
  if (req.method === 'POST') {
    const { title, tag, body } = req.body || {};
    if (!title) return res.status(400).json({ error: 'Title required' });

    const id = 'post_' + Date.now();
    const payload = { id, title, tag: tag || 'Update', body: body || '', createdAt: new Date().toISOString() };

    const r = await fetch(BASE + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-App-Id': APP_ID },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  // DELETE — remove news item
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'ID required' });

    const r = await fetch(BASE + '/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: { 'X-App-Id': APP_ID }
    });
    return res.status(r.status).json({ ok: r.ok });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};