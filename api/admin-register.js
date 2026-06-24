export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    console.error("ADMIN_SECRET is not set on server.");
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  // In a real app, you would save the user to a database.
  // Here we just mock a successful registration if they provide an email and password.
  if (email && password) {
    const token = Buffer.from(`${secret}::${Date.now()}`).toString('base64');
    return res.status(200).json({ success: true, token });
  }

  return res.status(400).json({ success: false, error: 'Email and password required' });
}
