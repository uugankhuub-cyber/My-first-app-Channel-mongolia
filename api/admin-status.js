
export default function handler(req, res) {
  // Simple check to see if the secret is configured, without revealing it
  const hasSecret = !!process.env.ADMIN_SECRET;
  return res.status(200).json({ 
    status: 'online', 
    configured: hasSecret 
  });
}
