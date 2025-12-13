
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    // Safety fallback if env var is missing on server
    console.error("ADMIN_SECRET is not set on server.");
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (password === secret) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false });
}
