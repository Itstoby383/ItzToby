const crypto = require('crypto');

const SECRET = process.env.ADMIN_SECRET || 'changeme-set-in-vercel';

function sign(payload) {
  const data = JSON.stringify(payload);
  const mac = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64url') + '.' + mac;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};

  const validEmail    = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return res.status(500).json({ error: 'Admin credentials not configured on server.' });
  }

  if (
    typeof email !== 'string' || typeof password !== 'string' ||
    email.trim().toLowerCase() !== validEmail.trim().toLowerCase() ||
    password !== validPassword
  ) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = sign({ role: 'admin', iat: Date.now() });
  return res.status(200).json({ token });
}