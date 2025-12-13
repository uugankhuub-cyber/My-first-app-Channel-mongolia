
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    console.error("ADMIN_SECRET is not set on server.");
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (password === secret) {
    // Generate a simple token (In production, use a signed JWT)
    // We base64 encode the secret + timestamp to create a rudimentary session token
    // that the server can verify by checking if it contains the secret.
    const token = Buffer.from(`${secret}::${Date.now()}`).toString('base64');
    return res.status(200).json({ success: true, token });
  }

  return res.status(401).json({ success: false });
}
