export default function handler(req, res) {
  res.status(200).json({
    hasSecret: Boolean(process.env.ADMIN_SECRET),
  });
}
